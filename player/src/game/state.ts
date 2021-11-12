import { Vector2 } from "../utils/vector"
import { IMonster, IPlayer, IPowerupState } from "./entity"
import { Block, BlockMatrix, IBlockState, IMap, stringToBlock } from "./map"
import getnextline from 'getnextline'
import { Constants } from "../constants"

export interface IState {
  tick: number;
  playerId: number;
  map: IMap;
  players: { [id: number]: IPlayer };
  monsters: { [id: number]: IMonster };
}

export const getState = ({ history }: { history: IState[] }): IState => {
  const oldState: IState | null = history.length > 0 ? history[history.length - 1] : null;

  let width, height, playerId, tick: any;
  let line = getnextline();

  [width, height, playerId, tick] = line
    .split(" ")
    .map((val: string) => parseInt(val));

  const blocks: BlockMatrix = [];
  for (let i = 0; i < height; i++) {
    let mapRow = getnextline().split('');
    const row = mapRow.map((v: string) => stringToBlock(v));
    blocks.push(row);
  }

  const n = parseInt(getnextline());

  const monsters: { [id: number]: IMonster } = {};
  const players: { [id: number]: IPlayer } = {};

  for (let i = 0; i < n; i++) {
    const line = getnextline().split(" ");
    const ent_type = line[0];
    const p_id = parseInt(line[1]);
    const x = parseInt(line[2]);
    const y = parseInt(line[3]);
    const param1 = parseInt(line[4]);
    const param2 = parseInt(line[5]);

    if (ent_type === 'm') {
      monsters[i] = {
        type: 'monster',
        id: i,
        position: new Vector2(x, y),
      };
    }
    else if (ent_type === 'p') {
      const player: IPlayer = {
        type: 'player',
        id: p_id,
        position: new Vector2(x, y),
        dagger: null,
        bonus: null,
      };

      const resolvePowerupState = (life: number, oldPowerup: IPowerupState | null | undefined): IPowerupState => {
        if (!oldPowerup) {
          return {
            firstTick: tick,
            ticksLeft: life,
          };
        }
        else {
          return {
            firstTick: oldPowerup.firstTick,
            ticksLeft: oldPowerup.ticksLeft - 1,
          };
        }
      }

      if (param1 === 1) {
        player.dagger = resolvePowerupState(Constants.daggerEquippedLife, oldState?.players[p_id]?.dagger)
      }

      if (param2 === 1) {
        player.bonus = resolvePowerupState(Constants.bonusEquippedLife, oldState?.players[p_id]?.bonus)
      }

      players[p_id] = player;
    }
  }

  const blocksWithState = [Block.dagger, Block.bonus];
  const blockStates: IBlockState[] = [];
  for (let i = 0; i < blocks.length; i++) {
    for (let j = 0; j < blocks[i].length; j++) {
      const position = new Vector2(j, i);

      const previousBlockState = oldState ? oldState.map.blockStates.find(state => state.position.equals(position)) : null;
      const isExisting = blocksWithState.includes(blocks[i][j]);

      if (previousBlockState && isExisting) {
        // Continuing its lifespan
        blockStates.push(previousBlockState);
      }
      else if (!previousBlockState && isExisting) {
        // Just appeared
        blockStates.push({
          position,
          firstTick: tick,
        });
      }
    }
  }

  return {
    tick,
    playerId,
    monsters,
    players,
    map: {
      width,
      height,
      blocks,
      blockStates,
    },
  }
}
