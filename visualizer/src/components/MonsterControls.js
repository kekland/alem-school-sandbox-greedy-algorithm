import React from 'react'

export const MonsterControls = ({ monsters, activeMonsterId, onChanged }) => {
  const buttons = [];

  for (const monster of monsters) {
    buttons.push(
      <button
        key={monster.id}
        className={monster.id === activeMonsterId ? 'active' : ''}
        onClick={() => onChanged(monster.id)}
      >
        Monster {monster.id}
      </button>
    )
  }

  return (
    <div style={{ display: 'flex', gap: 8, height: 24 }}>
      {buttons}
    </div>
  )
}