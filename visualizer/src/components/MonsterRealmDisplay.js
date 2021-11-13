import { Action } from 'player';
import React, { useEffect, useRef } from 'react'

export const MonsterRealmDisplay = ({ width, height, monsters, monsterRealms }) => {
  const ref = useRef()

  useEffect(() => {
    const context = ref.current.getContext('2d');

    context.clearRect(0, 0, width, height);

    for (const monster of monsters) {
      const initialPosition = monsterRealms[monster.id];
      const newPosition = monster.position;


      context.strokeStyle = 'rgba(255, 255, 255, 0.1)';
      context.lineWidth = 4;

      context.beginPath();
      context.moveTo(initialPosition.x * 50 + 24, initialPosition.y * 50 + 24)
      context.lineTo(newPosition.x * 50 + 24, newPosition.y * 50 + 24)

      context.stroke()
    }
  }, [width, height, monsters, monsterRealms, ref])

  return (
    <canvas width={width} height={height} ref={ref} />
  )
}