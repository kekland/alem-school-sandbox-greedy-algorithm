import { Action } from "./game/action";
import { IState } from "./game/state";
import { resolveBonusIntent } from "./intents/bonus-intent";
import { resolveCoinIntent } from "./intents/coin-intent";
import { resolveDaggerIntent } from "./intents/dagger-intent";
import { IIntent } from "./intents/intent";
import { resolveKillIntent } from "./intents/kill-intent";
import { resolveSafetyIntent } from "./intents/safety-intent";
import { Block, calculateSafetyMatrix } from "./module";
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

  const poiArgs = {
    start: player.position,
    blocks: state.map.blocks,
    entities: [...monstersList, ...otherPlayersList],
  };

  console.error('---State---');
  console.error(`Position: ${player.position.toString()}`);
  console.error(`Safety: ${safetyMatrix[player.position.y][player.position.x]}`);
  console.error('-----------');

  const poi = getPointsOfInterest(poiArgs);

  const safetyPoi = getPointsOfInterestWithSafety({
    ...poiArgs,
    safetyMatrix: safetyMatrix,
  });

  const dangerousPoi = getDangerousPointsOfInterest({ poi, safePoi: safetyPoi });

  const intentArgs = { state, player, safetyMatrix }

  let preferredBlockPoi: IPointsOfInterest;

  if (player.dagger != null) {
    preferredBlockPoi = dangerousPoi.blocks.length > 0 ? dangerousPoi : poi;
  }
  else if (safetyPoi.blocks.length > 0) {
    preferredBlockPoi = safetyPoi;
  } else {
    preferredBlockPoi = poi;
  }

  const monsterPois = Object.values(poi.entities).filter((v) => monsterIds.includes(v.target));

  const intents: IIntent[] = [
    ...resolveSafetyIntent({
      ...intentArgs,
      paths: monsterPois,
    }),
    ...resolveCoinIntent({
      ...intentArgs,
      paths: preferredBlockPoi.blocks.filter((v) => v.target === Block.coin),
    }),
    ...resolveDaggerIntent({
      ...intentArgs,
      paths: preferredBlockPoi.blocks.filter((v) => v.target === Block.dagger),
    }),
    ...resolveKillIntent({
      ...intentArgs,
      paths: monsterPois,
    }),
    ...resolveBonusIntent({
      ...intentArgs,
      paths: preferredBlockPoi.blocks.filter((v) => v.target === Block.bonus),
    })
  ];

  if (intents.length === 0) {
    return [
      {
        actions: [Action.stay],
        target: player.position,
        certainty: 0,
        duration: 0,
        payoff: 0,
      }
    ];
  }
  else {
    // Return the intent with the largest expected payoff
    return intents.sort((a, b) => {
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
  console.error(intents.slice(0, 5));

  return intents[0]
}