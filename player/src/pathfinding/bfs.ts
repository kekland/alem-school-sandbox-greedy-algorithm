import { Action, actionToVector2 } from "../game/action";
import { Block, BlockMatrix } from "../game/map";
import { Vector2 } from "../utils/vector";

export const _traversalActionsVerticalPriority = [Action.up, Action.down, Action.left, Action.right];
export const _traversalActionsHorizontalPriority = [Action.left, Action.right, Action.up, Action.down];

type IterateOnGameMapArgs = {
  start: Vector2;
  blocks: BlockMatrix;
  maxDepth?: number;
  verticalPriority?: boolean;
  callback: (position: Vector2, actions: Action[]) => boolean;
}

export const iterateOnGameMap = ({ start, blocks, maxDepth, callback, verticalPriority }: IterateOnGameMapArgs) => {
  const _maxDepth = maxDepth ?? 10000;

  const visited: boolean[][] = []

  for (let y = 0; y < blocks.length; y++) {
    visited.push([])
    for (let x = 0; x < blocks[y].length; x++) {
      visited[y].push(false)
    }
  }

  const queue: { position: Vector2, actions: Action[], depth: number }[] = [
    { position: start, actions: [], depth: 0 }
  ];

  const hasWallAtPosition = (point: Vector2) => {
    return blocks[point.y][point.x] === Block.wall;
  }

  const isValidPosition = (point: Vector2) => {
    return point.x >= 0 && point.y >= 0 &&
      point.x < blocks[0].length && point.y < blocks.length &&
      !hasWallAtPosition(point) &&
      !visited[point.y][point.x];
  }

  const _traversalActions = (verticalPriority ?? true) ?
    _traversalActionsVerticalPriority :
    _traversalActionsHorizontalPriority;

  while (queue.length > 0) {
    const item = queue.shift()!;

    if (!item) break;

    const { position, actions, depth } = item;

    if (depth > _maxDepth) continue;

    const result = callback(position, actions);

    if (result) continue;

    for (const action of _traversalActions) {
      const newPosition = position.add(actionToVector2(action));

      if (isValidPosition(newPosition)) {
        queue.push({ position: newPosition, actions: [...actions, action], depth: depth + 1 });
        visited[newPosition.y][newPosition.x] = true;
      }
    }
  }
}
