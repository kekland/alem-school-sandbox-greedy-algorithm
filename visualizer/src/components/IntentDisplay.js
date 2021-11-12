import { Action } from 'player';
import React, { useEffect, useRef } from 'react'

export const IntentDisplay = ({ width, height, position, intent }) => {
  const ref = useRef()

  useEffect(() => {
    const context = ref.current.getContext('2d');

    context.clearRect(0, 0, width, height);

    if (!intent) return;

    const target = intent.target ? {
      x: intent.target.x * 50,
      y: intent.target.y * 50,
    } : null;

    if (target) {
      context.fillStyle = 'rgba(255, 255, 0, 0.1)';
      context.fillRect(target.x, target.y, 48, 48);
    }

    context.strokeStyle = 'rgba(255, 255, 0, 0.1)';
    context.lineWidth = 4;

    context.beginPath();

    let currentPosition = { x: position.x * 50 + 24, y: position.y * 50 + 24 }

    context.moveTo(currentPosition.x, currentPosition.y)

    for (const action of intent.actions) {
      if (action === Action.up) {
        currentPosition.y -= 50;
      }
      else if (action === Action.down) {
        currentPosition.y += 50;
      }
      else if (action === Action.right) {
        currentPosition.x += 50;
      }
      else if (action === Action.left) {
        currentPosition.x -= 50;
      }

      context.lineTo(currentPosition.x, currentPosition.y);
    }

    context.stroke();
  }, [width, height, position, ref, intent])

  return (
    <canvas width={width} height={height} ref={ref} />
  )
}