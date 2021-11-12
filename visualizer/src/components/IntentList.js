import React from 'react'

export const IntentItem = ({ intent, isSelected, onClick }) => {
  return (
    <div
      className={`intent-item ${isSelected ? 'intent-item-selected' : ''}`}
      style={{ color: '#ababab' }}
      onClick={onClick}
    >
      <span>Target: {intent.target?.toString()}</span>
      <br /> <br />
      <span>Certainty: {intent.certainty}</span> <br />
      <span>Payoff: {intent.payoff}</span> <br />
      <span>Duration: {intent.duration}</span>
      <br /> <br />
      <span>Exp. payoff: {intent.payoff * intent.certainty}</span> <br />
      <span>Avg. payoff: {intent.payoff * intent.certainty / intent.duration}</span>
    </div>
  )
}

export const IntentList = ({ intents, actingIntent, onChanged }) => {
  return (
    <div className='intent-list-wrapper'>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <h3>Intents</h3>
        <br />
        {
          intents.map((intent, i) => <IntentItem
            key={i}
            isSelected={actingIntent && intent.target.equals(actingIntent.target)}
            intent={intent}
            onClick={() => onChanged(intent)}
          />)
        }
      </div>
    </div>
  )
}