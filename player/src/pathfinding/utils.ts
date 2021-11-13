import { BlockMatrix, MonsterRealms } from "../game/map"
import { IMonster, IPowerupState } from "../module";
import { manhattanDistance } from "../utils/utils";
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

export const isInMonsterRealm = ({ position, blocks, realms }: { position: Vector2, blocks: BlockMatrix, realms: MonsterRealms }): number[] => {
  const _realms: number[] = [];

  for (const realm in realms) {
    const safetyMatrix = calculateSafetyMatrix({ blocks, dangers: [realms[realm]] });

    if (safetyMatrix[position.y][position.x] <= 4) {
      _realms.push((realm as unknown) as number);
    }
  }

  return _realms;
}

type GetPursuersArgs = { realms: MonsterRealms, blocks: BlockMatrix, history: { position: Vector2, monsters: { [id: number]: IMonster } }[] };

export const getPursuers = ({ blocks, realms, history }: GetPursuersArgs): number[] => {
  if (history.length < 2) return [];

  const pursuers: number[] = [];

  const monsterPositions: { [id: number]: Vector2[] } = {};

  const { monsters } = history[history.length - 1]
  for (const id in monsters) {
    monsterPositions[id] = [];
  }

  for (const id in monsterPositions) {
    for (const { monsters } of history) {
      monsterPositions[id].push(monsters[id].position);
    }
  }

  for (const monsterId in monsterPositions) {
    const _monsterId = (monsterId as unknown) as number;
    const positions = monsterPositions[monsterId];

    const frameIndex = history.length - 1;
    const previousFrameIndex = history.length - 2;

    const frame = history[frameIndex];
    const previousFrame = history[previousFrameIndex];

    const safety = Math.min(8, calcuateSafety({ position: frame.position, blocks: blocks, dangers: [positions[frameIndex]] }));
    const previousSafety = Math.min(8, calcuateSafety({ position: previousFrame.position, blocks: blocks, dangers: [positions[previousFrameIndex]] }));

    const _realms = isInMonsterRealm({ position: previousFrame.position, blocks, realms });

    if (safety <= 5 && safety <= previousSafety && _realms.includes(_monsterId)) {
      pursuers.push(_monsterId);
    }
    else if (safety <= 4 && safety <= previousSafety && !_realms.includes(_monsterId)) {
      pursuers.push(_monsterId);
    }
  }

  return pursuers;
}