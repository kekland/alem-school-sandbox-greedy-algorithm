import { Constants } from "../constants";
import { actionToVector2, calcuateSafety, IIntent, IntentResolver, iterateOnGameMap, Vector2 } from "../module";
import { calculateShortestPath, IPath, IPathEntity, pathToString } from "../pathfinding/path";

export const resolveSafetyIntent: IntentResolver<IPathEntity> = ({ state, paths, player, safetyMatrix }) => {
  const currentSafety = safetyMatrix[player.position.y][player.position.x];

  if (currentSafety >= Constants.safetyThreshold) return [];
  if (player.dagger != null) return [];

  // Safety is urgent
  const monsters: { [id: number]: Vector2 } = {};

  for (const monsterPath of paths) {
    monsters[monsterPath.target] = monsterPath.end.copy();
  }

  const pathSafety: { [id: string]: { path: IPath, safety: number } } = {};

  iterateOnGameMap({
    start: player.position,
    blocks: state.map.blocks,
    maxDepth: 5,
    callback: (playerPosition, actions) => {
      const t = actions.length;

      if (t === 0) return false;

      const newMonsterPositions = Object.assign({}, monsters);

      for (const id in newMonsterPositions) {
        const monsterPosition = newMonsterPositions[id];

        const newMonsterPath = calculateShortestPath({ start: monsterPosition, end: playerPosition, blocks: state.map.blocks });

        if (!newMonsterPath) continue;
        if (newMonsterPath?.actions.length >= 5) continue;

        // Apply [t] actions to the monster's position and recalculate safety matrix
        const newMonsterPosition = monsterPosition.addMany(
          ...newMonsterPath.actions.slice(0, t).map(actionToVector2)
        )

        newMonsterPositions[id] = newMonsterPosition;
      }

      const safety = calcuateSafety({
        blocks: state.map.blocks,
        position: playerPosition,
        dangers: Object.values(newMonsterPositions),
      })

      const path: IPath = {
        actions,
        start: player.position,
        end: playerPosition,
        type: 'safety',
      }

      pathSafety[pathToString(path)] = {
        path,
        safety,
      }

      return safety <= 1;
    },
  });

  const escapePaths = Object.values(pathSafety).sort((a, b) => {
    if (b.safety > a.safety) return 1;
    else if (b.safety < a.safety) return -1;

    return b.path.actions.length - a.path.actions.length;
  });

  const intents: IIntent[] = escapePaths.map((v) => ({
    payoff: Constants.safetyPayoff,
    certainty: v.safety,
    duration: 1.0,
    actions: v.path.actions,
    target: v.path.end,
  }))

  return intents;
}