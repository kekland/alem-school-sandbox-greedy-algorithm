import { Block, calculateSafetyMatrix, calculateVisibilityMatrix, getSortedIntents, Vector2, getPointsOfInterest, getPointsOfInterestWithSafety, getDangerousPointsOfInterest } from 'player';
import React, { useEffect, useState } from 'react';
import { Grid } from './components/Grid';
import { Brushes } from './components/Brushes';
import { Params } from './components/Params';
import { IntentList } from './components/IntentList';
import { MonsterControls } from './components/MonsterControls';
import { ReplayPanel } from './components/ReplayPanel';
import { getReplayData, getStateFromReplayFrame } from './replay-parser';

const width = 13;
const height = 11;
const generateEmptyBlockMatrix = () => {
  const blockMatrix = [];

  for (let y = 0; y < height; y++) {
    blockMatrix.push([]);
    for (let x = 0; x < width; x++) {
      blockMatrix[y].push(Block.empty);
    }
  }

  return blockMatrix;
}

const getBlockStates = (blockMatrix) => {
  const blockStates = [];

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const block = blockMatrix[y][x];
      if (block === Block.dagger || block === Block.bonus) {
        blockStates.push({ position: new Vector2(x, y), firstTick: 0 });
      }
    }
  }

  return blockStates;
}

const changeBlockMatrix = (matrix, _x, _y, block) => {
  const blockMatrix = [];

  for (let y = 0; y < height; y++) {
    blockMatrix.push([]);
    for (let x = 0; x < width; x++) {
      if (x === _x && y === _y) {
        blockMatrix[y].push(matrix[y][x] === block ? Block.empty : block);
      }
      else {
        blockMatrix[y].push(matrix[y][x]);
      }
    }
  }

  return blockMatrix;
}

const createDefaultPlayerEntity = () => ({
  type: 'player',
  id: 1,
  position: new Vector2(0, 0),
  dagger: false,
  bonus: false,
})

const createOtherPlayerEntity = () => ({
  type: 'player-other',
  id: 2,
  position: new Vector2(12, 10),
  dagger: false,
  bonus: false,
})

const createDefaultParams = () => ({
  dagger: false,
  bonus: false,
})

const movePlayerEntity = (entity, blockMatrix, setBlockMatrix, params, setParams, direction) => {
  const newPosition = entity.position.add(direction);

  if (newPosition.x < 0 || newPosition.y < 0 || newPosition.x >= width || newPosition.y >= height) {
    return entity;
  }

  if (blockMatrix[newPosition.y][newPosition.x] === Block.wall) {
    return entity;
  }

  if (blockMatrix[newPosition.y][newPosition.x] === Block.dagger) {
    setParams({ ...params, dagger: true });
  }
  else if (blockMatrix[newPosition.y][newPosition.x] === Block.bonus) {
    setParams({ ...params, bonus: true });
  }

  setBlockMatrix(changeBlockMatrix(blockMatrix, newPosition.x, newPosition.y, Block.empty));

  return {
    ...entity,
    position: entity.position.add(direction),
  }
}

const App = () => {
  const [blockMatrix, setBlockMatrix] = useState(generateEmptyBlockMatrix())
  const [player, setPlayer] = useState(createDefaultPlayerEntity())
  const [otherPlayer, setOtherPlayer] = useState(createOtherPlayerEntity())
  const [monsters, setMonsters] = useState([])
  const [activeMonsterId, setActiveMonsterId] = useState(null)
  const [brush, setBrush] = useState(Block.empty);
  const [params, setParams] = useState(createDefaultParams())
  const [actingIntent, setActingIntent] = useState(null);
  const [replayData, setReplayData] = useState(null);
  const [replayFrame, setReplayFrame] = useState(null);
  const [scores, setScores] = useState({});

  useEffect(() => {
    if (!replayData || replayFrame == null) {
      setBlockMatrix(generateEmptyBlockMatrix());
      setPlayer(createDefaultPlayerEntity());
      setOtherPlayer(createOtherPlayerEntity());
      setMonsters([]);
      setActiveMonsterId(null);
      setParams(createDefaultParams());

      return;
    }

    const state = getStateFromReplayFrame(replayData, replayFrame);
    const player = state.players[state.playerId]

    const _monsters = Object.values(state.monsters)

    setBlockMatrix(state.map.blocks)
    setPlayer({
      ...state.players[state.playerId],
    })

    if (Object.values(state.players).length > 1) {
      setOtherPlayer({
        ...Object.values(state.players).find((v) => v.id !== state.playerId),
        type: 'player-other'
      })
    }

    setMonsters(_monsters.map((v) => ({ ...v, initialPosition: state.map.monsterRealms[v.id] })))
    setActiveMonsterId(_monsters.length > 0 ? _monsters[_monsters.length - 1].id : 0)
    setParams({ dagger: player.dagger != null, bonus: player.bonus != null })
    setScores(state.scores)

    console.log(state)
  }, [replayData, replayFrame])

  const entities = [player, otherPlayer, ...monsters]

  useEffect(() => {
    const _handleKeyDown = (event) => {
      let direction;
      let isMonster = false;
      let isOtherPlayer = false;
      switch (event.keyCode) {
        case 87: // w
          direction = new Vector2(0, -1);
          break;
        case 65: // a
          direction = new Vector2(-1, 0);
          break;
        case 83: // s
          direction = new Vector2(0, 1);
          break;
        case 68: // d
          direction = new Vector2(1, 0);
          break;
        case 37: // left
          isOtherPlayer = true;
          direction = new Vector2(-1, 0);
          break;
        case 38: // up
          isOtherPlayer = true;
          direction = new Vector2(0, -1);
          break;
        case 39: // right
          isOtherPlayer = true;
          direction = new Vector2(1, 0);
          break;
        case 40: // down
          isOtherPlayer = true;
          direction = new Vector2(0, 1);
          break;
        case 73: // i
          isMonster = true
          direction = new Vector2(0, -1);
          break;
        case 74: // j
          isMonster = true
          direction = new Vector2(-1, 0);
          break;
        case 75: // k
          isMonster = true
          direction = new Vector2(0, 1);
          break;
        case 76: // l
          isMonster = true
          direction = new Vector2(1, 0);
          break;
        default:
          break;
      }

      if (!direction) return;

      if (isMonster) {
        if (activeMonsterId) {
          setMonsters(monsters.map((monster) => {
            if (monster.id === activeMonsterId) {
              monster.position = monster.position.add(direction);
            }

            return monster;
          }));
        }
      }
      else if (isOtherPlayer) {
        setOtherPlayer((player) => player ?
          movePlayerEntity(player, blockMatrix, setBlockMatrix, params, setParams, direction) :
          null
        );
      } else {
        setPlayer((player) => movePlayerEntity(player, blockMatrix, setBlockMatrix, params, setParams, direction));
      }
    }

    document.addEventListener('keydown', _handleKeyDown);
    return () => document.removeEventListener('keydown', _handleKeyDown);
  }, [blockMatrix, params, activeMonsterId])

  const onBrushUsed = (x, y) => {
    if (brush === 'monster') {
      const monster = monsters.find(entity => entity.position.x === x && entity.position.y === y);
      if (monster != null) {
        const index = monsters.indexOf(monster);
        setMonsters([...monsters.slice(0, index), ...monsters.slice(index + 1)]);
        setActiveMonsterId(monsters[0]?.id);
      }
      else {
        setMonsters([
          ...monsters, {
            type: 'monster',
            id: monsters.length + 5,
            position: new Vector2(x, y),
            initialPosition: new Vector2(x, y),
          },
        ])
        setActiveMonsterId(monsters.length + 5);
      }
    }
    else {
      setBlockMatrix(changeBlockMatrix(blockMatrix, x, y, brush));
    }
  }

  const _monsters = {}

  for (const monster of monsters) {
    _monsters[monster.id] = monster;
  }

  const monsterRealms = Object.fromEntries(monsters.map((v) => [v.id, v.initialPosition]))

  const state = {
    tick: 0,
    playerId: player.id,
    map: {
      width,
      height,
      blocks: blockMatrix,
      blockStates: getBlockStates(blockMatrix),
      monsterRealms,
    },
    players: {
      [player.id]: {
        ...player,
        dagger: params.dagger ? { firstTick: 0, ticksLeft: 15 } : null,
        bonus: params.bonus ? { firstTick: 0, ticksLeft: 15 } : null,
      },
      [otherPlayer.id]: {
        ...otherPlayer,
        type: 'player',
        id: otherPlayer.id,
      }
    },
    monsters: _monsters,
  }

  const intents = getSortedIntents({ state, intentHistory: [], stateHistory: [] });
  const dangers = monsters.map((v) => v.position);
  const safetyMatrix = calculateSafetyMatrix({ blocks: blockMatrix, dangers });
  const visibilityMatrix = []

  const initialSafetyMatrix = calculateSafetyMatrix({ blocks: blockMatrix, dangers: monsters.map((v) => v.initialPosition) })
  for (let i = 0; i < initialSafetyMatrix.length; i++) {
    visibilityMatrix.push([])
    for (let j = 0; j < initialSafetyMatrix[i].length; j++) {
      visibilityMatrix[i].push(initialSafetyMatrix[i][j] <= 4)
    }
  }

  const poiArgs = {
    start: player.position,
    blocks: state.map.blocks,
    entities: [...monsters],
  };

  const poi = getPointsOfInterest(poiArgs);

  const safetyPoi = getPointsOfInterestWithSafety({
    ...poiArgs,
    safetyMatrix: safetyMatrix,
    visibilityMatrix: visibilityMatrix,
    monsterRealms,
  });

  const dangerousPoi = getDangerousPointsOfInterest({ poi, safePoi: safetyPoi });

  useEffect(() => {
    const intents = getSortedIntents({ state, intentHistory: [], stateHistory: [] });
    setActingIntent(intents[0]);
  }, [blockMatrix, player, monsters, params]);

  return (
    <>
      <IntentList intents={intents} actingIntent={actingIntent} onChanged={setActingIntent} />
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <Brushes currentBrush={brush} onChanged={setBrush} />
        <div style={{ height: 12 }} />
        <Grid
          blockMatrix={blockMatrix}
          safetyMatrix={safetyMatrix}
          visibilityMatrix={visibilityMatrix}
          player={player}
          entities={entities}
          monsters={monsters}
          monsterRealms={monsterRealms}
          actingIntent={actingIntent}
          poi={poi}
          safetyPoi={safetyPoi}
          dangerousPoi={dangerousPoi}
          onTap={onBrushUsed}
        />
        <div style={{ height: 12 }} />
        <Params params={params} onChanged={setParams} />
        <div style={{ height: 12 }} />
        <MonsterControls
          monsters={monsters}
          activeMonsterId={activeMonsterId}
          onChanged={setActiveMonsterId}
        />
        <div style={{ height: 12 }} />
        <ReplayPanel
          replayData={replayData}
          replayFrame={replayFrame}
          setReplayData={setReplayData}
          setReplayFrame={setReplayFrame}
          scores={scores}
        />
      </div>
    </>
  )
}

export default App;