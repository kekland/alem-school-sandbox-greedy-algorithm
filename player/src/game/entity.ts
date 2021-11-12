import { Vector2 } from "../utils/vector";

export interface IEntity {
  type: string;
  id: number;
  position: Vector2;
}

export function isEntity(object: any): object is IEntity {
  return object.id !== undefined && object.position !== undefined;
}

export interface IPowerupState {
  firstTick: number;
  ticksLeft: number;
}

export interface IPlayer extends IEntity {
  type: 'player';
  dagger: IPowerupState | null;
  bonus: IPowerupState | null;
}

export const isPlayer = (entity: any): entity is IPlayer => {
  return isEntity(entity) && (entity as IEntity).type === 'player';
};

export interface IMonster extends IEntity {
  type: 'monster';
}

export const isMonster = (entity: any): entity is IMonster => {
  return isEntity(entity) && (entity as IEntity).type === 'monster';
};

