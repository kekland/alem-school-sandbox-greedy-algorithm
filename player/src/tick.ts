import { Constants } from "./constants";
import { Action, actionToVector2 } from "./game/action";
import { IState } from "./game/state";
import { resolveBonusIntent } from "./intents/bonus-intent";
import { resolveCoinIntent } from "./intents/coin-intent";
import { resolveDaggerIntent } from "./intents/dagger-intent";
import { IIntent } from "./intents/intent";
import { resolveKillIntent } from "./intents/kill-intent";
import { escapePathsFromPosition, isDeath, isInDanger, resolveSafetyIntent } from "./intents/safety-intent";
import { Block, calculateSafetyMatrix, calculateVisibilityMatrix, getPursuers, isInMonsterRealm } from "./module";
import { simulatePath } from "./pathfinding/path";
import { getDangerousPointsOfInterest, getPointsOfInterest, getPointsOfInterestWithSafety, IPointsOfInterest } from "./pathfinding/poi";

type TickArgs = { state: IState, stateHistory: IState[], intentHistory: IIntent[] };

export const getSortedIntents = ({ state, stateHistory, intentHistory }: TickArgs): IIntent[] => {
  const player = state.players[state.playerId]

  const monstersList = Object.values(state.monsters)
  const playersList = Object.values(state.players)

  const monsterIds = monstersList.map((v) => v.id)
  const playerIds = playersList.map((v) => v.id)

  const otherPlayersList = playersList.filter((v) => v.id !== state.playerId);

  const safetyMatrix = calculateSafetyMatrix({
    blocks: state.map.blocks,
    dangers: monstersList.map((v) => v.position)
  })

  const visibilityMatrix = calculateVisibilityMatrix({
    blocks: state.map.blocks,
    positions: monstersList.map((v) => v.position),
  })

  const monsterRealms = state.map.monsterRealms;

  const poiArgs = {
    start: player.position,
    blocks: state.map.blocks,
    entities: [...monstersList, ...otherPlayersList],
  };

  const pursuers = getPursuers({
    realms: state.map.monsterRealms,
    blocks: state.map.blocks,
    history: stateHistory.map((v) => ({
      position: v.players[v.playerId].position,
      otherPosition: Object.values(v.players).find((n) => n.id !== v.playerId)?.position,
      monsters: v.monsters,
    })),
  });

  const _isInDanger = isInDanger({ player, pursuers, blocks: state.map.blocks, position: player.position, monsterRealms, safetyMatrix, visibilityMatrix })

  console.error('---State---');
  console.error(`Position: ${player.position.toString()}`);
  console.error(`Danger: ${_isInDanger}`);
  console.error(`Safety: ${safetyMatrix[player.position.y][player.position.x]}`);
  console.error(`Dagger: ${player.dagger?.ticksLeft}, Bonus: ${player.bonus?.ticksLeft}`);
  console.error(`Realms: ${isInMonsterRealm({ position: player.position, blocks: state.map.blocks, realms: monsterRealms })}`);
  console.error(`Pursuers: ${JSON.stringify(pursuers)}`);
  console.error('-----------');

  const poi = getPointsOfInterest(poiArgs);

  const safetyPoi = getPointsOfInterestWithSafety({
    ...poiArgs,
    safetyMatrix: safetyMatrix,
    visibilityMatrix: visibilityMatrix,
    monsterRealms,
  });

  const dangerousPoi = getDangerousPointsOfInterest({ poi, safePoi: safetyPoi });

  const intentArgs = { state, player, safetyMatrix, visibilityMatrix, monsterRealms }

  let preferredBlockPoi: IPointsOfInterest;

  if (player.dagger != null) {
    preferredBlockPoi = dangerousPoi.blocks.length > 0 ? dangerousPoi : poi;
  }
  else if (safetyPoi.blocks.length > 0) {
    preferredBlockPoi = safetyPoi;
  } else {
    preferredBlockPoi = poi;
  }

  // console.error(`${monsterIds} \npos: ${JSON.stringify(monstersList, null, 2)}`);
  const monsterPois = poi.entities.filter((v) => v.type === 'monster' && monsterIds.includes(v.target));

  const intents: IIntent[] = [];

  intents.push(
    ...resolveDaggerIntent({
      ...intentArgs,
      paths: [
        ...poi.blocks.filter((v) => v.target === Block.dagger),
        ...safetyPoi.blocks.filter((v) => v.target === Block.dagger),
      ],
    }),
  )

  if (_isInDanger) {
    intents.push(...resolveSafetyIntent({
      ...intentArgs,
      paths: monsterPois,
    }));
  }
  else {
    intents.push(
      ...resolveCoinIntent({
        ...intentArgs,
        paths: preferredBlockPoi.blocks.filter((v) => v.target === Block.coin),
      }),
      ...resolveKillIntent({
        ...intentArgs,
        paths: monsterPois,
      }),
      ...resolveBonusIntent({
        ...intentArgs,
        paths: preferredBlockPoi.blocks.filter((v) => v.target === Block.bonus),
      })
    );
  }

  const safeIntents = _isInDanger ? intents : intents.filter((v) => {
    if (!v.target) return true;

    let deathIndex = -1;

    let previousSafety = safetyMatrix[player.position.y][player.position.x];

    simulatePath({
      actions: v.actions,
      start: player.position,
      end: v.target,
      type: 'path'
    }, (i, position) => {
      if (player.dagger != null && player.dagger.ticksLeft > 4) return false;

      if (isDeath({ player, position, blocks: state.map.blocks, monsterRealms, safetyMatrix })) {
        return true;
      }

      const _relevantRealms = isInMonsterRealm({ position, blocks: state.map.blocks, realms: monsterRealms })

      for (const realm of _relevantRealms) {
        const _safetyMatrixWithRelevantRealm = calculateSafetyMatrix({
          blocks: state.map.blocks, dangers: [state.monsters[realm].position]
        })

        const safety = _safetyMatrixWithRelevantRealm[position.y][position.x]

        const multiplier = safety >= previousSafety ? 1 : 2;
        previousSafety = safety;

        if (safety < (i + 1) * multiplier) {
          deathIndex = i;
          return true;
        }
      }
    });

    return deathIndex === -1 || deathIndex > 1;
  });

  if (safeIntents.length === 0) {
    return [
      {
        actions: [Action.stay],
        target: player.position,
        certainty: 0,
        duration: 0,
        payoff: 0,
        validateSafety: false,
      }
    ];
  }
  else {
    // Return the intent with the largest expected payoff
    return safeIntents.sort((a, b) => {
      const expectedPayoffA = a.certainty * a.payoff;
      const expectedPayoffB = b.certainty * b.payoff;

      const averagePayoffA = expectedPayoffA / a.duration;
      const averagePayoffB = expectedPayoffB / b.duration;

      return averagePayoffB - averagePayoffA;
    });
  }
}

export const tick = (args: TickArgs): IIntent => {
  const intents = getSortedIntents(args);
  console.error(JSON.stringify(intents.slice(0, 3), null, 2));

  return intents[0]
}