import React from 'react'
import { BlockComponent } from './Block';
import { IntentDisplay } from './IntentDisplay';
import { MonsterRealmDisplay } from './MonsterRealmDisplay';

const _width = 13;
const _height = 11;

export const Grid = ({ blockMatrix, safetyMatrix, visibilityMatrix, player, actingIntent, entities, monsterRealms, monsters, onTap, poi, safetyPoi, dangerousPoi }) => {
  const blocks = [];

  for (let y = 0; y < _height; y++) {
    for (let x = 0; x < _width; x++) {
      const _poi = poi.blocks.filter(poi => poi.end.x === x && poi.end.y === y)
      const _safetyPoi = safetyPoi.blocks.filter(poi => poi.end.x === x && poi.end.y === y)

      blocks.push(
        <BlockComponent
          block={blockMatrix[y][x]}
          safety={safetyMatrix ? safetyMatrix[y][x] : Number.MAX_SAFE_INTEGER}
          visibility={visibilityMatrix ? visibilityMatrix[y][x] : false}
          isTargeted={actingIntent && actingIntent.target.x === x && actingIntent.target.y === y}
          entities={entities.filter(entity => entity.position.x === x && entity.position.y === y)}
          monsterRealm={Object.values(monsterRealms).filter(realm => realm.x === x && realm.y === y)}
          poi={_safetyPoi.length > 0 ? 'safety' : (_poi.length > 0 ? 'dangerous' : null)}
          onChange={() => onTap(x, y)}
          key={`${x}-${y}`}
        />
      );
    }
  }

  const width = 48 * 13 + 2 * 12;
  const height = 48 * 11 + 2 * 10;

  return (
    <div className='grid-wrapper'>
      <div className='grid' style={{ position: 'absolute' }}>
        {blocks}
      </div>
      <div className='grid-canvas' style={{ width: width, height: height }}>
        <IntentDisplay width={width} height={height} position={player.position} intent={actingIntent} />
      </div>
      <div className='grid-canvas' style={{ width: width, height: height }}>
        <MonsterRealmDisplay width={width} height={height} position={player.position} monsters={monsters} monsterRealms={monsterRealms} />
      </div>
    </div>
  )
}