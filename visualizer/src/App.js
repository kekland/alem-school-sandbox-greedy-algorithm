import { Block, calculateSafetyMatrix, calculateVisibilityMatrix, getSortedIntents, Vector2 } from 'player';
import React, { useEffect, useState } from 'react';
import { Grid } from './components/Grid';
import { Brushes } from './components/Brushes';
import { Params } from './components/Params';
import { IntentList } from './components/IntentList';

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

let currentId = 2;
const App = () => {
  const [blockMatrix, setBlockMatrix] = useState(generateEmptyBlockMatrix())
  const [player, setPlayer] = useState(createDefaultPlayerEntity())
  const [monsters, setMonsters] = useState([])
  const [brush, setBrush] = useState(Block.empty);
  const [params, setParams] = useState(createDefaultParams())
  const [actingIntent, setActingIntent] = useState(null);

  const entities = [player, ...monsters]

  useEffect(() => {
    const _handleKeyDown = (event) => {
      let direction;
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
        default:
          break;
      }

      if (!direction) return;

      setPlayer((player) => movePlayerEntity(player, blockMatrix, setBlockMatrix, params, setParams, direction));
    }

    document.addEventListener('keydown', _handleKeyDown);
    return () => document.removeEventListener('keydown', _handleKeyDown);
  }, [blockMatrix, params])

  const onBrushUsed = (x, y) => {
    if (brush === 'monster') {
      const monster = monsters.find(entity => entity.position.x === x && entity.position.y === y);
      if (monster != null) {
        const index = monsters.indexOf(monster);
        setMonsters([...monsters.slice(0, index), ...monsters.slice(index + 1)]);
      }
      else {
        setMonsters([
          ...monsters, {
            type: 'monster',
            id: currentId,
            position: new Vector2(x, y),
          },
        ])
        currentId += 1;
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

  const state = {
    tick: 0,
    playerId: 1,
    map: {
      width,
      height,
      blocks: blockMatrix,
      blockStates: getBlockStates(blockMatrix),
    },
    players: {
      [player.id]: {
        ...player,
        dagger: params.dagger ? { firstTick: 0, ticksLeft: 15 } : null,
        bonus: params.bonus ? { firstTick: 0, ticksLeft: 15 } : null,
      }
    },
    monsters: _monsters,
  }

  const intents = getSortedIntents({ state, intentHistory: [], stateHistory: [] });
  const dangers = monsters.map((v) => v.position);
  const safetyMatrix = calculateSafetyMatrix({ blocks: blockMatrix, dangers });
  const visibilityMatrix = calculateVisibilityMatrix({ positions: dangers, blocks: blockMatrix });

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
          actingIntent={actingIntent}
          onTap={onBrushUsed}
        />
        <div style={{ height: 12 }} />
        <Params params={params} onChanged={setParams} />
      </div>
    </>
  )
}

export default App;