import { Action } from "../game/action";
import { IPlayer, IState, SafetyMatrix, VisibilityMatrix } from "../module";
import { IPath } from "../pathfinding/path";
import { Vector2 } from "../utils/vector";

export interface IIntent {
  certainty: number;
  duration: number;
  payoff: number;
  actions: Action[];
  validateSafety: boolean;
  target?: Vector2;
}

export type IntentResolver<T> = (args: {
  state: IState,
  player: IPlayer,
  paths: T[],
  safetyMatrix: SafetyMatrix,
  visibilityMatrix: VisibilityMatrix,
}) => IIntent[];
