import { Vector2, BlockMatrix, IEntity, Block, SafetyMatrix, VisibilityMatrix } from "../module";
import { iterateOnGameMap } from "./bfs";
import { IPath, IPathBlock, IPathEntity } from "./path";

type GetPointsOfInterestArgs = { start: Vector2, blocks: BlockMatrix, entities: IEntity[], predicate?: (position: Vector2) => boolean };

export interface IPointsOfInterest {
  blocks: IPathBlock[];
  entities: { [id: number]: IPathEntity };
}

const interestingBlocks = [Block.coin, Block.dagger, Block.bonus];

export const getPointsOfInterest = ({ start, blocks, entities, predicate }: GetPointsOfInterestArgs): IPointsOfInterest => {
  const pointsOfInterestBlocks: IPathBlock[] = [];
  const pointsOfInterestEntities: { [id: number]: IPathEntity } = {};

  iterateOnGameMap({
    start,
    blocks,
    callback: (position, actions) => {
      if (predicate && predicate(position)) {
        return true;
      }

      const block = blocks[position.y][position.x];

      const entity = entities.find(m => m.position.x === position.x && m.position.y === position.y);

      if (interestingBlocks.includes(block)) {
        pointsOfInterestBlocks.push({ type: 'block', start, end: position, actions: actions, target: block });
      }

      if (entity != null)
        pointsOfInterestEntities[entity.id] = {
          type: 'entity',
          start,
          end: position,
          actions: actions,
          target: entity.id,
        };

      return false;
    }
  });

  return {
    blocks: pointsOfInterestBlocks,
    entities: pointsOfInterestEntities,
  }
}

type GetPointsOfInterestWithSafetyArgs = { start: Vector2, blocks: BlockMatrix, safetyMatrix: SafetyMatrix, visibilityMatrix: VisibilityMatrix, entities: IEntity[] };

export const getPointsOfInterestWithSafety = ({ start, blocks, safetyMatrix, visibilityMatrix, entities }: GetPointsOfInterestWithSafetyArgs): IPointsOfInterest => {
  return getPointsOfInterest({
    start,
    blocks,
    entities,
    predicate: (position) => safetyMatrix[position.y][position.x] <= 4 || !visibilityMatrix[position.y][position.x]
  });
}

type GetDangerousPoisArgs = { poi: IPointsOfInterest, safePoi: IPointsOfInterest };

export const getDangerousPointsOfInterest = ({ poi, safePoi }: GetDangerousPoisArgs): IPointsOfInterest => {
  const dangerousPoi: IPointsOfInterest = {
    blocks: [],
    entities: {},
  };

  for (const block of poi.blocks) {
    if (safePoi.blocks.find(m => m.end.equals(block.end)) == null) {
      dangerousPoi.blocks.push(block);
    }
  }

  for (const entity of Object.values(poi.entities)) {
    if (safePoi.entities[entity.target] == null) {
      dangerousPoi.entities[entity.target] = entity;
    }
  }

  return dangerousPoi;
}