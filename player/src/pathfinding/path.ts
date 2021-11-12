import { Constants } from "../constants";
import { Action, actionToVector2, Block, BlockMatrix, IEntity, iterateOnGameMap, SafetyMatrix, Vector2 } from "../module";

export interface IPath {
  type: string;

  start: Vector2;
  end: Vector2;
  actions: Action[];
}

export const pathToString = (path: IPath): string => {
  return `${path.type} ${path.start.x} ${path.start.y} ${path.end.x} ${path.end.y} ${path.actions.map(actionToVector2).join(" ")}`;
}

export interface IPathBlock extends IPath {
  type: 'block';
  target: Block;
}

export const isPathBlock = (obj: IPath): obj is IPathBlock => obj.type === 'block';

export interface IPathEntity extends IPath {
  type: 'entity';
  target: number;
}

export const isPathEntity = (obj: IPath): obj is IPathEntity => obj.type === 'entity';


export const simulatePath = (path: IPath, callback: (i: number, position: Vector2) => void) => {
  let currentPosition = path.start;
  let distance = 0;

  for (const action of path.actions) {
    callback(distance, currentPosition);

    currentPosition = currentPosition.add(actionToVector2(action));
    distance += 1;
  }
}

export const getPathSafety = ({ path, safetyMatrix }: { path: IPath, safetyMatrix: SafetyMatrix }): number => {
  let safety = 1.0;

  simulatePath(path, (t, position) => {
    const absoluteSafety = safetyMatrix[position.y][position.x];
    const relativeSafety = absoluteSafety - t * Constants.pathSafetyRelativeDangerScale;

    if (relativeSafety <= Constants.pathSafetyRelativeDangerThreshold) {
      safety *= Constants.pathSafetyDangerousMultiplier;
    }
  })

  return safety;
}

type CalculateShortestPathArgs = { start: Vector2, end: Vector2, blocks: BlockMatrix, verticalPriority?: boolean };

export const calculateShortestPath = ({ start, end, blocks, verticalPriority }: CalculateShortestPathArgs): IPath => {
  let path: IPath

  iterateOnGameMap({
    start,
    blocks,
    verticalPriority,
    callback: (position, actions) => {
      if (position.equals(end)) {
        path = {
          type: 'position',
          start,
          end,
          actions,
        };
      }

      return path !== undefined;
    },
  });

  return path!;
}
