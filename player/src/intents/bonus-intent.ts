import { Constants } from "../constants";
import { IIntent, IntentResolver, isPathSafeWithDagger } from "../module";
import { getPathSafety, IPathBlock } from "../pathfinding/path";

export const resolveBonusIntent: IntentResolver<IPathBlock> = ({ state, player, paths, safetyMatrix }) => {
  const intents: IIntent[] = [];

  for (const path of paths) {
    const blockState = state.map.blockStates.find((v) => v.position.equals(path.end))!;
    const ticksLeft = Constants.bonusLife - (state.tick - blockState.firstTick);

    // We can't equip this in time, ignore it
    if (path.actions.length >= ticksLeft) continue;

    const safety = isPathSafeWithDagger({ daggerState: player.dagger, path }) ? 1.0 : getPathSafety({ path, safetyMatrix })

    intents.push({
      actions: path.actions,
      certainty: safety,
      duration: path.actions.length,
      payoff: Constants.bonusPayoff,
      target: path.end,
    })
  }

  return intents;
}