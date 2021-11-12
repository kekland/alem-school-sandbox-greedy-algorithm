import { Action } from "../game/action";
import { IPlayer, IState, SafetyMatrix } from "../module";
import { IPath } from "../pathfinding/path";
import { Vector2 } from "../utils/vector";

export interface IIntent {
  certainty: number;
  duration: number;
  payoff: number;
  actions: Action[];
  target?: Vector2;
}

export type IntentResolver<T> = (args: {
  state: IState,
  player: IPlayer, 
  paths: T[],
  safetyMatrix: SafetyMatrix,
}) => IIntent[];