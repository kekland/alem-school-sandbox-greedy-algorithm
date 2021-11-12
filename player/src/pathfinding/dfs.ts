import { Action, actionToVector2, Block, BlockMatrix, inverseAction, Vector2 } from "../module"

export const _traversalActions = [Action.up, Action.down, Action.left, Action.right];

type IterateOnGameMapArgs = {
  start: Vector2;
  blocks: BlockMatrix;
  maxDepth?: number;
  callback: (position: Vector2, actions: Action[]) => boolean;
}

export const iterateOnGameMapBranched = ({ start, blocks, maxDepth, callback }: IterateOnGameMapArgs) => {
  const _maxDepth = maxDepth ?? 4;

  const hasWallAtPosition = (point: Vector2) => {
    return blocks[point.y][point.x] === Block.wall;
  }

  const isValidPosition = (point: Vector2) => {
    return point.x >= 0 && point.y >= 0 &&
      point.x < blocks[0].length && point.y < blocks.length &&
      !hasWallAtPosition(point)
  }

  const _iterate = (position: Vector2, blocks: BlockMatrix, depth: number, actions: Action[], callback: (position: Vector2, actions: Action[]) => boolean) => {
    for (const action of _traversalActions.filter((v) => v !== inverseAction(actions[actions.length - 1]))) {
      const newPosition = position.add(actionToVector2(action));

      if (depth < _maxDepth && isValidPosition(newPosition) && !callback(newPosition, [...actions, action])) {
        _iterate(newPosition, blocks, depth + 1, [...actions, action], callback);
      }
    }
  }

  _iterate(start, blocks, 0, [], callback);
}