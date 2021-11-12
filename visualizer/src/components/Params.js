import React from 'react'

export const Params = ({ params, onChanged }) => {
  const buttons = [];

  for (const param in params) {
    buttons.push(
      <button
        key={param}
        className={params[param] ? 'active' : ''}
        onClick={() => onChanged({ ...params, [param]: !params[param] })}
      >
        {param}
      </button>
    )
  }

  return (
    <div style={{ display: 'flex', gap: 8 }}>
      {buttons}
    </div>
  )
}