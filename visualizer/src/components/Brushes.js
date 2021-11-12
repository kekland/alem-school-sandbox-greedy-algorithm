import React from 'react'
import { Block } from 'player';

export const Brushes = ({ currentBrush, onChanged }) => {
  const types = {
    [Block.empty]: 'Empty',
    [Block.wall]: 'Wall',
    [Block.bonus]: 'Bonus',
    [Block.dagger]: 'Dagger',
    [Block.coin]: 'Coin',
    'monster': 'Monster',
  };

  const buttons = [];

  for (const type in types) {
    buttons.push(
      <button
        key={type}
        className={currentBrush === type ? 'selected' : ''}
        onClick={() => onChanged(type)}
      >
        {types[type]}
      </button>
    )
  }

  return (
    <div style={{ display: 'flex', gap: 8 }}>
      {buttons}
    </div>
  )
}