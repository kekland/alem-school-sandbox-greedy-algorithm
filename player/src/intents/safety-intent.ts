import { Constants } from "../constants";
import { Action, actionListToString, actionToVector2, Block, calcuateSafety, calculateVisibilityMatrix, IIntent, IntentResolver, IPlayer, IState, isVisible, iterateOnGameMap, SafetyMatrix, Vector2, VisibilityMatrix } from "../module";
import { iterateOnGameMapBranched } from "../pathfinding/dfs";
import { calculateShortestPath, IPath, IPathEntity, pathToString, simulatePath } from "../pathfinding/path";
import { manhattanDistance } from "../utils/utils";

type IsInDangerArgs = {
  position: Vector2,
  player: IPlayer,
  safetyMatrix: SafetyMatrix,
  visibilityMatrix: VisibilityMatrix,
}


export const isInDanger = ({ position, player, safetyMatrix, visibilityMatrix }: IsInDangerArgs): boolean => {
  const currentSafety = safetyMatrix[position.y][position.x];
  const isVisible = visibilityMatrix[position.y][position.x];

  if (currentSafety >= Constants.safetyThreshold) return false;
  if (currentSafety > 3 && !isVisible) return false;
  if (player.dagger != null && player.dagger.ticksLeft > 4) return false;

  return true;
}

type EscapePathsFromPositionArgs = {
  position: Vector2,
  state: IState,
  player: IPlayer,
  dangers: Vector2[],
  safetyMatrix: SafetyMatrix,
  visibilityMatrix: VisibilityMatrix,
}

export const escapePathsFromPosition = ({ position, player, state, dangers, safetyMatrix, visibilityMatrix }: EscapePathsFromPositionArgs): { path: IPath, safety: number, coinsCollected: number }[] | null => {
  if (!isInDanger({ position, player, safetyMatrix, visibilityMatrix })) return null;

  const monsters: { [id: number]: Vector2 } = {};

  for (const danger of dangers) {
    monsters[dangers.indexOf(danger)] = danger;
  }

  const monsterPositions: { [id: string]: { [id: number]: Vector2 } } = {};
  const pathSafety: { [id: string]: { path: IPath, safety: number, coinsCollected: number } } = {};

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
    maxDepth: Constants.safetyIterationDepth,
    callback: (playerPosition, actions) => {
      const t = actions.length;

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

      for (const id in _monsterPositions) {
        const monsterPosition = _monsterPositions[id];

        if (manhattanDistance(monsterPosition, playerPosition) <= 8) {
          _relevantMonsterPositions.push((id as unknown) as number);
        }
      }

      for (const id of _relevantMonsterPositions) {
        const monsterPosition = _monsterPositions[id];

        const _traversalActions = [Action.left, Action.right, Action.up, Action.down];

        let minSafety: number = Infinity;
        let minAction: Action;
        for (const action of _traversalActions) {
          const newMonsterPosition = monsterPosition.add(actionToVector2(action));

          if (!isValidPosition(newMonsterPosition)) continue;

          let safetySum = 0;
          for (const playerAction of _traversalActions) {
            const newPlayerPosition = playerPosition.add(actionToVector2(playerAction));

            if (!isValidPosition(newPlayerPosition)) continue;

            const safety = calcuateSafety({
              blocks: state.map.blocks,
              position: newPlayerPosition,
              dangers: [newMonsterPosition],
            })

            safetySum += safety
          }

          if (safetySum < minSafety) {
            minSafety = safetySum;
            minAction = action;
          }
        }

        const newMonsterPosition = monsterPosition.add(
          actionToVector2(minAction!)
        )

        _monsterPositions[id] = newMonsterPosition;
      }

      if (t === 0) return false;

      monsterPositions[actionId] = Object.assign({}, _monsterPositions);

      const safety = calcuateSafety({
        blocks: state.map.blocks,
        position: playerPosition,
        dangers: Object.values(_monsterPositions),
      })

      // Death!
      if (safety <= 1) {
        return true;
      }

      let coinsCollected = 0;

      const path: IPath = {
        actions,
        start: player.position,
        end: playerPosition,
        type: 'safety',
      }

      simulatePath(path, (i, position) => {
        if (state.map.blocks[position.y][position.x] === Block.coin) {
          coinsCollected++;
        }
      })

      pathSafety[actionId] = {
        path,
        safety,
        coinsCollected,
      }

      return false;
    },
  });

  const escapePaths = Object.values(pathSafety)
    .filter((v) => v.path.actions.length > 1)

  return escapePaths;
}

export const resolveSafetyIntent: IntentResolver<IPathEntity> = ({ state, paths, player, safetyMatrix, visibilityMatrix }) => {
  const escapePaths = escapePathsFromPosition({
    dangers: paths.map((p) => p.end),
    player,
    position: player.position,
    safetyMatrix,
    state,
    visibilityMatrix,
  })

  if (escapePaths == null) return [];

  const intents: IIntent[] = escapePaths.map((v) => ({
    payoff: Constants.safetyPayoff + (v.safety * 0.5) + v.coinsCollected,
    certainty: 1.0,
    duration: 1.0,
    actions: v.path.actions,
    target: v.path.end,
    validateSafety: false,
  }))

  return intents;
}