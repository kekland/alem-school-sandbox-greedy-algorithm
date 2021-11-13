import { Constants } from "../constants";
import { Vector2, BlockMatrix, IEntity, Block, SafetyMatrix, VisibilityMatrix, MonsterRealms } from "../module";
import { iterateOnGameMap } from "./bfs";
import { IPath, IPathBlock, IPathEntity } from "./path";
import { isInMonsterRealm } from "./utils";

type GetPointsOfInterestArgs = { start: Vector2, blocks: BlockMatrix, entities: IEntity[], predicate?: (i: number, position: Vector2) => boolean };

export interface IPointsOfInterest {
  blocks: IPathBlock[];
  entities: IPathEntity[];
}

const interestingBlocks = [Block.coin, Block.dagger, Block.bonus];

export const getPointsOfInterest = ({ start, blocks, entities, predicate }: GetPointsOfInterestArgs): IPointsOfInterest => {
  const pointsOfInterestBlocks: IPathBlock[] = [];
  const pointsOfInterestEntities: IPathEntity[] = [];

  iterateOnGameMap({
    start,
    blocks,
    callback: (position, actions) => {
      if (predicate && predicate(actions.length, position)) {
        return true;
      }

      const block = blocks[position.y][position.x];

      const entity = entities.find(m => m.position.x === position.x && m.position.y === position.y);

      if (interestingBlocks.includes(block)) {
        pointsOfInterestBlocks.push({ type: 'block', start, end: position, actions: actions, target: block });
      }

      if (entity != null)
        pointsOfInterestEntities.push({
          type: entity.type === 'player' ? 'player' : 'monster',
          start,
          end: position,
          actions: actions,
          target: entity.id,
        });

      return false;
    }
  });

  return {
    blocks: pointsOfInterestBlocks,
    entities: pointsOfInterestEntities,
  }
}

type GetPointsOfInterestWithSafetyArgs = { start: Vector2, blocks: BlockMatrix, monsterRealms: MonsterRealms, safetyMatrix: SafetyMatrix, visibilityMatrix: VisibilityMatrix, entities: IEntity[] };

export const getPointsOfInterestWithSafety = ({ start, blocks, safetyMatrix, visibilityMatrix, monsterRealms, entities }: GetPointsOfInterestWithSafetyArgs): IPointsOfInterest => {
  // const isCurrentlyInMonsterRealm = isInMonsterRealm({ position: start, realms: monsterRealms }).length > 0;
  // const currentSafety = safetyMatrix[start.y][start.x];

  const extraSafePois = getPointsOfInterest({
    start,
    blocks,
    entities,
    predicate: (i, position) => {
      return isInMonsterRealm({ blocks, position, realms: monsterRealms }).length > 0 ||
        safetyMatrix[position.y][position.x] <= 2;
    },
  });

  if (extraSafePois.blocks.length !== 0) {
    return extraSafePois;
  }

  return getPointsOfInterest({
    start,
    blocks,
    entities,
    predicate: (i, position) => {
      if (i <= 1) return false;

      const safety = safetyMatrix[position.y][position.x];

      return safety <= 1;
    },
  });
}

type GetDangerousPoisArgs = { poi: IPointsOfInterest, safePoi: IPointsOfInterest };

export const getDangerousPointsOfInterest = ({ poi, safePoi }: GetDangerousPoisArgs): IPointsOfInterest => {
  const dangerousPoi: IPointsOfInterest = {
    blocks: [],
    entities: [],
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