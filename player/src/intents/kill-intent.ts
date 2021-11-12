import { Constants } from "../constants";
import { IIntent, IntentResolver } from "../module";
import { IPathEntity } from "../pathfinding/path";

export const resolveKillIntent: IntentResolver<IPathEntity> = ({ state, paths, player, safetyMatrix }) => {
  if (player.dagger == null) return [];

  const intents: IIntent[] = [];

  for (const monsterPath of paths) {
    const distance = monsterPath.actions.length;

    // We will not kill the monster in time, ignore it
    if (player.dagger.ticksLeft < distance / 1.5) continue;

    if (distance <= 4) {
      intents.push({
        certainty: 1.0,
        actions: monsterPath.actions,
        duration: monsterPath.actions.length,
        payoff: Constants.killPayoff,
        target: monsterPath.end,
        validateSafety: false,
      })
    }
  }

  return intents;
}