import React from 'react'
import { Block, getBlockName } from 'player'

import Bonus from '../assets/bonus.png'
import Coin from '../assets/coin.png'
import Dagger from '../assets/dagger.png'
import Monster from '../assets/monster.png'
import MonsterRealm from '../assets/monster-realm.png'
import Player from '../assets/player.png'
import PlayerOther from '../assets/player-2.png'
import { lerpColor } from '../utils'

export const BlockComponent = ({ block, safety, visibility, entities, monsterRealm, onChange, poi }) => {
  let contentImgs = [];
  let text1 = [];
  let text2 = [];

  if (block === Block.bonus) {
    contentImgs.push(Bonus);
  }
  else if (block === Block.coin) {
    contentImgs.push(Coin);
  }
  else if (block === Block.dagger) {
    contentImgs.push(Dagger);
  }

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

  if (monsterRealm.length > 0) {
    contentImgs.push(MonsterRealm);
  }

  let backgroundColor;
  if (safety < Number.MAX_SAFE_INTEGER) {
    backgroundColor = lerpColor('#ff2626', '#262626', Math.min(1.0, safety / 7.0));
  }

  return (
    <div
      className={`block block-${getBlockName(block)}`}
      onClick={onChange}
    >
      <div style={{ width: 48, height: 48, backgroundColor, opacity: 0.1 }} />
      <div style={{ width: 48, height: 48, backgroundColor: 'white', opacity: visibility ? 0.2 : 0.0 }} />
      <div style={{ width: 48, height: 48, backgroundColor: poi ? (poi === 'safety' ? 'green' : 'red') : null, opacity: 0.2 }} />
      <div style={{ opacity: 0.35, color: 'black' }}>
        {backgroundColor != null ? safety : null}
      </div>
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
