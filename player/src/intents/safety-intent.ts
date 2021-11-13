import { Constants } from "../constants";
import { Action, actionListToString, actionToVector2, Block, BlockMatrix, calcuateSafety, calculateVisibilityMatrix, IIntent, IntentResolver, IPlayer, isInMonsterRealm, IState, isVisible, iterateOnGameMap, MonsterRealms, SafetyMatrix, Vector2, VisibilityMatrix } from "../module";
import { iterateOnGameMapBranched } from "../pathfinding/dfs";
import { calculateShortestPath, IPath, IPathEntity, pathToString, simulatePath } from "../pathfinding/path";
import { manhattanDistance } from "../utils/utils";

type IsInDangerArgs = {
  position: Vector2,
  player: IPlayer,
  blocks: BlockMatrix,
  safetyMatrix: SafetyMatrix,
  visibilityMatrix: VisibilityMatrix,
  pursuers: number[],
  monsterRealms: MonsterRealms,
}


export const isInDanger = ({ position, blocks, player, pursuers, safetyMatrix, visibilityMatrix, monsterRealms }: IsInDangerArgs): boolean => {
  const currentSafety = safetyMatrix[position.y][position.x];
  // const isVisible = visibilityMatrix[position.y][position.x];

  const relevantMonsterRealms = isInMonsterRealm({ blocks, position, realms: monsterRealms });


  if (player.dagger != null && player.dagger.ticksLeft > 6) return false;
  if (currentSafety > Constants.safetyThreshold - 2 && pursuers.length === 0) return false;

  if (currentSafety > Constants.safetyThreshold) return false;
  if (relevantMonsterRealms.length === 0 && currentSafety > 3) {
    return false;
  }

  return true;
}

type IsDeathArgs = {
  position: Vector2,
  player: IPlayer,
  blocks: BlockMatrix,
  safetyMatrix: SafetyMatrix,
  monsterRealms: MonsterRealms,
}

export const isDeath = ({ position, player, safetyMatrix, blocks, monsterRealms }: IsDeathArgs): boolean => {
  const currentSafety = safetyMatrix[position.y][position.x];

  let hasPointWithGreaterSafety = false;
  iterateOnGameMap({
    start: position,
    blocks,
    maxDepth: currentSafety,
    callback: (position, actions) => {
      const _safety = safetyMatrix[position.y][position.x];

      if (_safety < currentSafety) {
        return true;
      }

      hasPointWithGreaterSafety = true;
      return false;
    },
  })

  return !hasPointWithGreaterSafety;
}

type EscapePathsFromPositionArgs = {
  position: Vector2,
  state: IState,
  player: IPlayer,
  dangers: Vector2[],
  safetyMatrix: SafetyMatrix,
  monsterRealms: MonsterRealms,
  visibilityMatrix: VisibilityMatrix,
  depth?: number,
}

export const escapePathsFromPosition = ({ position, player, state, dangers, monsterRealms, safetyMatrix, visibilityMatrix, depth }: EscapePathsFromPositionArgs): { path: IPath, safety: number, coinsCollected: number, probability: number, historicalDangers: Vector2[][] }[] | null => {
  // if (!isInDanger({ position, player, safetyMatrix, monsterRealms, visibilityMatrix })) return null;

  const monsters: { [id: number]: Vector2 } = {};

  for (const danger of dangers) {
    monsters[dangers.indexOf(danger)] = danger;
  }

  const monsterPositions: { [id: string]: { [id: number]: Vector2 } } = {};
  const pathSafety: { [id: string]: { path: IPath, safety: number, probability: number, coinsCollected: number, historicalDangers: Vector2[][] } } = {};

  const isValidPosition = (point: Vector2): boolean => !(
    point.x < 0 ||
    point.y < 0 ||
    point.x >= state.map.width ||
    point.y >= state.map.height ||
    state.map.blocks[point.y][point.x] === Block.wall
  );

  iterateOnGameMapBranched({
    start: position,
    blocks: state.map.blocks,
    maxDepth: depth ?? Constants.safetyIterationDepth,
    callback: (playerPosition, actions) => {
      const t = actions.length;

      monsterPositions[''] = Object.assign({}, monsters);
      if (t === 0) return false;

      const previousActions = actions.slice(0, t - 1);

      const actionId = actionListToString(actions)
      const previousActionId = actionListToString(previousActions);

      const prevStatePlayerPosition = playerPosition.sub(actionToVector2(actions[actions.length - 1]))
      const hasMonsterPositionsForPreviousAction = monsterPositions[previousActionId] != null;

      const _monsterPositions = hasMonsterPositionsForPreviousAction ?
        Object.assign({}, monsterPositions[previousActionId]) :
        Object.assign({}, monsters)

      for (const id in _monsterPositions) {
        const position = _monsterPositions[id];

        if (position.equals(playerPosition)) {
          return true;
        }
      }

      const _relevantMonsterPositions: number[] = []
      const _relevantMonsterRealms = isInMonsterRealm({ blocks: state.map.blocks, position, realms: monsterRealms })

      for (const id in _monsterPositions) {
        const _id = (id as unknown) as number;

        const monsterPosition = _monsterPositions[_id];

        if (manhattanDistance(monsterPosition, playerPosition) <= 5 || _relevantMonsterRealms.includes(_id)) {
          _relevantMonsterPositions.push(_id);
        }

        const safety = calcuateSafety({
          blocks: state.map.blocks,
          position: playerPosition,
          dangers: [monsterPosition],
        })

        if (t === 0 && safety === 0) {
          return true;
        }
      }

      let possibleActionCount = 0;
      for (const id of _relevantMonsterPositions) {
        const monsterPosition = _monsterPositions[id];

        const _traversalActions = [Action.left, Action.right, Action.up, Action.down];

        // const delta = monsterPosition.sub(playerPosition);

        // let vector: Vector2;
        // let altVector: Vector2 | null = null;

        // if (Math.abs(delta.x) === 0) {
        //   vector = new Vector2(0, delta.y > 0 ? -1 : 1);
        // }
        // else if (Math.abs(delta.y) === 0) {
        //   vector = new Vector2(delta.x > 0 ? -1 : 1, 0);
        // }
        // else if (Math.abs(delta.y) > Math.abs(delta.x)) {
        //   vector = new Vector2(0, delta.y > 0 ? -1 : 1);
        //   altVector = new Vector2(delta.x > 0 ? -1 : 1, 0);
        //   probability = 0.5
        // }
        // else {
        //   vector = new Vector2(delta.x > 0 ? -1 : 1, 0);
        //   altVector = new Vector2(0, delta.y > 0 ? -1 : 1);
        //   probability = 0.5
        // }

        // let newMonsterPosition = monsterPosition.add(vector);

        // if (!isValidPosition(newMonsterPosition) && altVector) {
        //   newMonsterPosition = monsterPosition.add(altVector);
        //   probability = 1.0
        // }

        // if (!isValidPosition(newMonsterPosition)) {
        //   probability = 1.0
        //   continue;
        // }

        // _monsterPositions[id] = newMonsterPosition;


        let minSafety: number = Infinity;
        let minAction: Action;

        const actionSafety: { [action: string]: number } = {}
        for (const action of _traversalActions) {
          const newMonsterPosition = monsterPosition.add(actionToVector2(action));

          if (!isValidPosition(newMonsterPosition)) continue;

          let safety = calcuateSafety({ blocks: state.map.blocks, dangers: [newMonsterPosition], position: playerPosition })

          // for (const playerAction of _traversalActions) {
          //   const newPlayerPosition = playerPosition.add(actionToVector2(playerAction));

          //   if (!isValidPosition(newPlayerPosition)) continue;

          //   const safety = calcuateSafety({
          //     blocks: state.map.blocks,
          //     position: newPlayerPosition,
          //     dangers: [newMonsterPosition],
          //   })

          //   if (safety > _maxSafety) {
          //     _maxSafety = safety;
          //   }
          // }

          actionSafety[action] = safety

          if (safety < minSafety) {
            minSafety = safety;
            minAction = action;
          }
        }

        for (const action in actionSafety) {
          if (actionSafety[action] === minSafety) {
            possibleActionCount += 1;
          }
        }

        const newMonsterPosition = monsterPosition.add(
          actionToVector2(minAction!)
        )

        _monsterPositions[id] = newMonsterPosition;
      }

      monsterPositions[actionId] = Object.assign({}, _monsterPositions);

      const safety = calcuateSafety({
        blocks: state.map.blocks,
        position: playerPosition,
        dangers: Object.values(_monsterPositions),
      })

      let probabilityMultiplier = 1.0;

      // Death!
      if (safety === 0) {
        return true;
      }

      let coinsCollected = 0;

      const path: IPath = {
        actions,
        start: position,
        end: playerPosition,
        type: 'safety',
      }

      simulatePath(path, (i, position) => {
        if (state.map.blocks[position.y][position.x] === Block.coin) {
          coinsCollected++;
        }
        if (state.map.blocks[position.y][position.x] === Block.dagger) {
          coinsCollected += 1000;
        }
      })

      const dangers: Vector2[][] = []

      for (let i = 0; i <= actions.length; i++) {
        const _actions = actions.slice(0, i);
        const dangerPositions = Object.values(monsterPositions[actionListToString(_actions)]);
        dangers.push(dangerPositions)
      }

      pathSafety[actionId] = {
        path,
        safety,
        coinsCollected,
        probability: (pathSafety[previousActionId]?.probability ?? 1.0) * (1 / possibleActionCount) * probabilityMultiplier,
        historicalDangers: dangers,
      }

      return false;
    },
  });

  const escapePaths = Object.values(pathSafety)
    .filter((v) => v.path.actions.length > Constants.safetyIterationDepth / 2.0)

  return escapePaths;
}

export const resolveSafetyIntent: IntentResolver<IPathEntity> = ({ state, paths, player, monsterRealms, safetyMatrix, visibilityMatrix }) => {
  const escapePaths = escapePathsFromPosition({
    dangers: paths.map((p) => p.end),
    player,
    position: player.position,
    safetyMatrix,
    state,
    monsterRealms,
    visibilityMatrix,
  })

  if (escapePaths == null) return [];


  const intents: IIntent[] = escapePaths.map((v) => {
    const safety = safetyMatrix[v.path.end.y][v.path.end.x];

    const i = {
      payoff: Constants.safetyPayoff + safety * 2.0 + v.coinsCollected,
      certainty: (1.0 / v.path.actions.length),
      duration: 1.0,
      actions: v.path.actions,
      target: v.path.end,
      validateSafety: false,
      description: v.historicalDangers,
    }

    return i;
  })

  return intents;
}