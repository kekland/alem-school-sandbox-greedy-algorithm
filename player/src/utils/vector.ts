export class Vector2 {
  x: number;
  y: number;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  add(v: Vector2) {
    return new Vector2(this.x + v.x, this.y + v.y);
  }

  addMany(...vs: Vector2[]) {
    return vs.reduce((acc, v) => acc.add(v), this);
  }

  sub(v: Vector2) {
    return new Vector2(this.x - v.x, this.y - v.y);
  }

  equals(v: Vector2) {
    return this.x === v.x && this.y === v.y;
  }

  copy(): Vector2 {
    return new Vector2(this.x, this.y);
  }

  toString() {
    return `(${this.x}, ${this.y})`;
  }
}
