import { Vector2 } from "../utils/vector";


export enum Block {
  empty = '.',
  wall = '!',
  coin = '#',
  dagger = 'd',
  bonus = 'b',
}

export const getBlockName = (block: Block): string => {
  switch (block) {
    case Block.empty: return 'empty';
    case Block.wall: return 'wall';
    case Block.coin: return 'coin';
    case Block.dagger: return 'dagger';
    case Block.bonus: return 'bonus';
  }
}

export const stringToBlock = (str: string): Block => {
  switch (str) {
    case '.':
      return Block.empty;
    case '!':
      return Block.wall;
    case '#':
      return Block.coin;
    case 'd':
      return Block.dagger;
    case 'b':
      return Block.bonus;
    default:
      return Block.wall;
  }
}

export interface IBlockState {
  position: Vector2;
  firstTick: number;
}

export type BlockMatrix = Block[][];
export type MonsterRealms = { [id: number]: Vector2 };

export interface IMap {
  width: number;
  height: number;
  blocks: BlockMatrix;
  blockStates: IBlockState[];
  monsterRealms: { [id: number]: Vector2 };
}
