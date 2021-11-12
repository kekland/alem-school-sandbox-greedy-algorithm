import { BlockMatrix } from "../game/map"
import { IPowerupState } from "../module";
import { Vector2 } from "../utils/vector"
import { iterateOnGameMap } from "./bfs";
import { IPath } from "./path";

type CalculateSafetyMatrixArgs = { blocks: BlockMatrix, dangers: Vector2[] };
export type SafetyMatrix = number[][];

export const calculateSafetyMatrix = ({ blocks, dangers }: CalculateSafetyMatrixArgs): SafetyMatrix => {
  const safetyMatrix: SafetyMatrix = [];

  for (let y = 0; y < blocks.length; y++) {
    safetyMatrix.push([])
    for (let x = 0; x < blocks[y].length; x++) {
      safetyMatrix[y].push(Number.MAX_SAFE_INTEGER);
    }
  }

  for (const danger of dangers) {
    iterateOnGameMap({
      start: danger,
      blocks,
      callback: (position, actions) => {
        const distance = actions.length;
        safetyMatrix[position.y][position.x] = Math.min(safetyMatrix[position.y][position.x], distance);
        return false;
      },
    });
  }

  return safetyMatrix;
}

type CalculateSafetyArgs = { position: Vector2, blocks: BlockMatrix, dangers: Vector2[] };

export const calcuateSafety = ({ position, blocks, dangers }: CalculateSafetyArgs): number => {
  return calculateSafetyMatrix({ blocks, dangers })[position.y][position.x];
}

type IsPathSafeWithDaggerArgs = { daggerState: IPowerupState | null, path: IPath }

export const isPathSafeWithDagger = ({ daggerState, path }: IsPathSafeWithDaggerArgs): boolean => {
  return daggerState != null && daggerState.ticksLeft > 3;
}