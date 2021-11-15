import React from 'react'
import { getBlockName } from 'player'

import Monster from '../assets/monster.png'
import MonsterRealm from '../assets/monster-realm.png'
import Player from '../assets/player.png'
import PlayerOther from '../assets/player-2.png'
import { lerpColor } from '../utils'

export const EntityComponent = ({ id, entities, style, monsterRealm, onChange }) => {
  let contentImgs = [];
  let text1 = [];
  let text2 = [];

  const player = entities.find((v) => v.type === 'player')
  if (player) {
    contentImgs.push(Player);
    if (player.name) {
      text1.push(...player.name.split(','))
    }

    if (player.dagger) {
      text1.push('Dagger')
    }
    if (player.bonus) {
      text1.push('Bonus')
    }
  }

  const otherPlayer = entities.find((v) => v.type === 'player-other')
  if (otherPlayer) {
    contentImgs.push(PlayerOther);

    if (otherPlayer.name) {
      text2.push(...otherPlayer.name.split(','));
    }

    if (otherPlayer.dagger) {
      text2.push('Dagger')
    }
    if (otherPlayer.bonus) {
      text2.push('Bonus')
    }
  }

  if (entities.find((v) => v.type === 'monster')) {
    contentImgs.push(Monster);
  }

  if (monsterRealm.length > 0 && !entities.find((v) => v.type === 'monster')) {
    contentImgs.push(MonsterRealm);
  }

  return (
    <div
      id={id}
      className={`entity`}
      style={style}
    >
      {
        contentImgs.map((v) => <img key={v} dswidth={42} height={42} src={v} alt='lol' />)
      }
      <span style={{ position: 'absolute', fontSize: 10, opacity: 0.75, width: 100, paddingTop: 48, zIndex: 5, textAlign: 'center' }}>
        <span style={{ color: '#619bfa' }}>{text1 ? text1.join(' ') : ''}</span>
        {text1.length > 0 && text2.length > 0 ? <><br /> <br /></> : null}
        <span style={{ color: '#60a75b' }}>{text2 ? text2.join(' ') : ''}</span>
      </span>
    </div>
  )
}
