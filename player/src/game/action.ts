import { Vector2 } from "../utils/vector";

export enum Action {
  left = 'left',
  right = 'right',
  up = 'up',
  down = 'down',
  stay = 'stay'
}

export const inverseAction = (action: Action): Action => {
  switch (action) {
    case Action.left:
      return Action.right;
    case Action.right:
      return Action.left;
    case Action.up:
      return Action.down;
    case Action.down:
      return Action.up;
    default:
      return Action.stay;
  }
}

export const actionToVector2 = (action: Action): Vector2 => {
  switch (action) {
    case Action.left:
      return new Vector2(-1, 0);
    case Action.right:
      return new Vector2(1, 0);
    case Action.up:
      return new Vector2(0, -1);
    case Action.down:
      return new Vector2(0, 1);
    default:
      return new Vector2(0, 0);
  }
}

export const actionListToString = (actionList: Action[]): string => {
  return actionList.join(', ');
}
