import { Constants } from "../constants";
import { IIntent, IntentResolver, isPathSafeWithDagger } from "../module";
import { getPathSafety, IPathBlock, simulatePath } from "../pathfinding/path";

export const resolveCoinIntent: IntentResolver<IPathBlock> = ({ state, player, paths, safetyMatrix }) => {
  const intents: IIntent[] = [];

  for (const path of paths) {
    const safety = isPathSafeWithDagger({ daggerState: player.dagger, path }) ? 1.0 : getPathSafety({ path, safetyMatrix })

    intents.push({
      actions: path.actions,
      certainty: safety,
      duration: path.actions.length,
      payoff: Constants.coinPayoff * (player.bonus != null ? 2.0 : 1.0),
      target: path.end,
      validateSafety: true,
    })
  }

  return intents;
}