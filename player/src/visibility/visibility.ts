import { Constants } from "../constants";
import { Block, BlockMatrix, Vector2 } from "../module";
import { manhattanDistance } from "../utils/utils";

export type VisibilityMatrix = boolean[][];

type CalculateVisibilityMatrixArgs = { positions: Vector2[], blocks: BlockMatrix, radius?: number };

// Bresenham's line algorithm
const plotLineLow = (x0: number, y0: number, x1: number, y1: number, callback: (x: number, y: number) => boolean) => {
  const dx = x1 - x0;
  let dy = y1 - y0;
  let yi = 1;

  if (dy < 0) {
    yi = -1;
    dy = -dy;
  }

  let D = (2 * dy) - dx;
  let y = y0;

  for (let x = x0; x <= x1; x++) {
    if (callback(x, y)) break;

    if (D > 0) {
      y += yi;
      D += (2 * (dy - dx));
    }
    else {
      D += 2 * dy;
    }
  }
}

const plotLineHigh = (x0: number, y0: number, x1: number, y1: number, callback: (x: number, y: number) => boolean) => {
  let dx = x1 - x0;
  const dy = y1 - y0;
  let xi = 1;

  if (dx < 0) {
    xi = -1;
    dx = -dx;
  }

  let D = (2 * dx) - dy;
  let x = x0;

  for (let y = y0; y <= y1; y++) {
    if (callback(x, y)) break;

    if (D > 0) {
      x += xi;
      D += (2 * (dx - dy));
    }
    else {
      D += 2 * dx;
    }
  }
}

const plotLine = (x0: number, y0: number, x1: number, y1: number, callback: (x: number, y: number) => boolean) => {
  if (Math.abs(y1 - y0) < Math.abs(x1 - x0)) {
    if (x0 < x1) {
      plotLineLow(x0, y0, x1, y1, callback);
    }
    else {
      plotLineLow(x1, y1, x0, y0, callback);
    }
  }
  else {
    if (y0 < y1) {
      plotLineHigh(x0, y0, x1, y1, callback);
    }
    else {
      plotLineHigh(x1, y1, x0, y0, callback);
    }
  }
}


export const calculateVisibilityMatrix = ({ positions, blocks, radius }: CalculateVisibilityMatrixArgs): VisibilityMatrix => {
  // Use Bresenham's algorithm to calculate the visibility matrix
  const visibilityMatrix: VisibilityMatrix = [];

  const _radius = radius ?? Constants.defaultVisibilityRadius;

  for (let y = 0; y < blocks.length; y++) {
    visibilityMatrix.push([]);
    for (let x = 0; x < blocks[y].length; x++) {
      visibilityMatrix[y].push(false);
    }
  }

  for (const position of positions) {
    for (let y = 0; y < blocks.length; y++) {
      for (let x = 0; x < blocks[y].length; x++) {
        let hasWall = false;

        plotLine(position.x, position.y, x, y, (x, y) => {
          const point = new Vector2(x, y);

          if (manhattanDistance(point, position) >= _radius) {
            hasWall = true;
            return true;
          }

          if (blocks[y][x] === Block.wall) {
            hasWall = true;
            return true;
          }

          return false;
        });


        visibilityMatrix[y][x] = visibilityMatrix[y][x] || !hasWall;
      }
    }
  }

  return visibilityMatrix;
}

export const isVisible = ({ light, position, blocks }: { light: Vector2, position: Vector2, blocks: BlockMatrix }) => {
  return calculateVisibilityMatrix({ positions: [light], blocks })[position.y][position.x];
}