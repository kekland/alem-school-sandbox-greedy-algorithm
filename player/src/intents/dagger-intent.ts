import { Constants } from "../constants";
import { IIntent, IntentResolver } from "../module";
import { getPathSafety, IPathBlock, simulatePath } from "../pathfinding/path";

export const resolveDaggerIntent: IntentResolver<IPathBlock> = ({ state, player, paths, safetyMatrix }) => {
  const currentSafety = safetyMatrix[player.position.y][player.position.x];
  const intents: IIntent[] = [];

  for (const path of paths) {
    const blockState = state.map.blockStates.find((v) => v.position.equals(path.end))!;
    const ticksLeft = Constants.daggerLife - (state.tick - blockState.firstTick);

    // We can't equip this in time, ignore it
    if (path.actions.length >= ticksLeft) continue;

    let isTotallySafe = true;
    simulatePath(path, (i, position) => {
      if (safetyMatrix[position.y][position.x] <= i + 2) {
        isTotallySafe = false;
      }
    })

    const safety = getPathSafety({ path, safetyMatrix })

    intents.push({
      actions: path.actions,
      certainty: isTotallySafe ? 1.0 : safety,
      duration: path.actions.length,
      payoff: currentSafety <= Constants.safetyThreshold && isTotallySafe ?
        Constants.criticalDaggerPayoff :
        Constants.daggerPayoff,
      target: path.end,
    })
  }

  return intents;
}