import { Block, Vector2 } from 'player'
import headers from '../../headers'

export const getReplayData = async (urlOrId) => {
  // https://cup.alem.school/main/playback/6fd9f0c9-c04a-4945-b6d3-16d0140ae122
  let id;

  if (urlOrId.startsWith('http')) {
    const parts = urlOrId.split('/')
    id = parts[parts.length - 1]
  }
  else {
    id = urlOrId
  }

  let url = `https://s3.alem.school/storage/gamesessions/${id}.json`

  const data = await (await fetch(url, { headers: headers })).json()

  let playerTeamId = data.result.find((v) => v.username.includes('kekland'))?.team_id

  if (!playerTeamId) {
    playerTeamId = data.result[1].team_id
  }

  return {
    ...data,
    playerTeamId,
  }
}

export const getStateFromReplayFrame = (data, frame) => {
  const blocks = []
  const monsters = {}
  const players = {}

  for (let y = 0; y < 11; y++) {
    blocks.push([])
    for (let x = 0; x < 13; x++) {
      blocks[y].push(Block.empty)
    }
  }

  for (const coin of data.initial_state.coins) {
    blocks[coin.y][coin.x] = Block.coin;
  }

  for (const wall of data.initial_state.walls) {
    blocks[wall.y][wall.x] = Block.wall;
  }

  const monsterRealms = {}
  for (const monster of data.initial_state.monsters) {
    const id = parseInt(monster.n[1])

    monsters[id] = {
      type: 'monster',
      id,
      position: new Vector2(monster.x, monster.y),
    }

    monsterRealms[id] = new Vector2(monster.x, monster.y)
  }

  let playerId
  const scores = {}
  for (const player of data.initial_state.players) {
    const id = parseInt(player.n[1])

    if (data.playerTeamId === player.t) {
      playerId = id;
    }

    players[id] = {
      type: 'player',
      id,
      position: new Vector2(player.x, player.y),
      dagger: null,
      bonus: null,
      name: data.result.find((v) => v.team_id === player.t).username,
      team: player.t,
    }

    scores[player.t] = 0;
  }

  const blockStates = []

  const state = {
    tick: frame,
    playerId,
    map: {
      width: 13,
      height: 11,
      blocks,
      blockStates,
      monsterRealms,
    },
    players,
    monsters,
  }

  for (let t = 0; t < frame; t++) {
    const frame = data.frames[t]

    for (const movement of frame.m) {
      const _id = movement.n;
      const isPlayer = _id.startsWith('p');

      const id = _id[1];

      const direction = movement.m;
      const oldPosition = isPlayer ? state.players[id].position : state.monsters[id].position;

      let delta;
      if (direction === 'u') {
        delta = new Vector2(0, -1);
      }
      else if (direction === 'd') {
        delta = new Vector2(0, 1);
      }
      else if (direction === 'l') {
        delta = new Vector2(-1, 0);
      }
      else if (direction === 'r') {
        delta = new Vector2(1, 0);
      }

      const newPosition = oldPosition.add(delta);

      if (isPlayer) {
        state.players[id].position = newPosition;
      }
      else {
        state.monsters[id].position = newPosition;
      }
    }

    for (const feature of frame.ft) {
      const block = feature.n === 'bonus' ? Block.bonus : Block.dagger;

      state.map.blocks[feature.y][feature.x] = block;
      state.map.blockStates.push({
        position: new Vector2(feature.x, feature.y),
        firstTick: t + 1,
      });
    }

    for (const dissapearance of frame.d) {
      const type = dissapearance.n;
      const position = new Vector2(dissapearance.x, dissapearance.y);

      const players = dissapearance.p;
      state.map.blocks[position.y][position.x] = Block.empty;

      if (type.startsWith('m')) {
        const id = parseInt(type[1]);
        delete state.monsters[id]
        delete state.map.monsterRealms[id]
      }
      else if (type === Block.coin) {
        for (const player of players) {
          const id = player.n[1]
          scores[state.players[id].team] = player.c;
        }
      }
      else if (type === 'bonus') {
        for (const player of players) {
          const id = player.n[1]
          state.players[id].bonus = player.c === 0 ? null : {};
        }
      } else if (type === 'dagger') {
        for (const player of players) {
          const id = player.n[1]
          state.players[id].dagger = player.c === 0 ? null : {};
        }
      }
    }

    if (frame.c === true) {
      for (const coin of data.initial_state.coins) {
        blocks[coin.y][coin.x] = Block.coin;
      }
    }
  }

  return { ...state, scores };
}
