import { Vector2 } from "./vector";

export const manhattanDistance = (v1: Vector2, v2: Vector2) => {
  return Math.abs(v1.x - v2.x) + Math.abs(v1.y - v2.y);
}
