import React from 'react'
import { Block, getBlockName } from 'player'

import Bonus from '../assets/bonus.png'
import Coin from '../assets/coin.png'
import Dagger from '../assets/dagger.png'
import Monster from '../assets/monster.png'
import Player from '../assets/player.png'
import { lerpColor } from '../utils'


export const BlockComponent = ({ block, safety, entities, onChange }) => {
  let contentImgs = [];

  if (block === Block.bonus) {
    contentImgs.push(Bonus);
  }
  else if (block === Block.coin) {
    contentImgs.push(Coin);
  }
  else if (block === Block.dagger) {
    contentImgs.push(Dagger);
  }

  if (entities.find((v) => v.type === 'player')) {
    contentImgs.push(Player);
  }

  if (entities.find((v) => v.type === 'monster')) {
    contentImgs.push(Monster);
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
      <div style={{ opacity: 0.35, color: 'black' }}>
        {backgroundColor != null ? safety : null}
      </div>
      {
        contentImgs.map((v) => <img key={v} dswidth={42} height={42} src={v} alt='lol' />)
      }
    </div>
  )
}
