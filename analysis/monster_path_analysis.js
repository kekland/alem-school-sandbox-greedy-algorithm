const axios = require('axios').default
const fs = require('fs')
const headers = require('../headers')

const getData = async () => {
  const { data } = await axios.get('https://s3.alem.school/storage/gamesessions/bf961619-ba20-46b0-a094-99b2145b1400.json', { headers })

  return data;
}

const manhattanDistance = (p1, p2) => {
  return Math.abs(p1.x - p2.x) + Math.abs(p1.y - p2.y);
}

const main = async () => {
  const data = await getData();

  const initialMonsterPositions = data.initial_state.monsters
  const monsterPositions = {}
  const maximiumMonsterDistance = {}

  for (const monster of initialMonsterPositions) {
    monsterPositions[monster.n] = [{ x: monster.x, y: monster.y }]
    maximiumMonsterDistance[monster.n] = 0
  }

  for (const frame of data.frames) {
    for (const monsterDelta of frame.m) {
      const id = monsterDelta.n

      if (id in monsterPositions) {
        const newPosition = { x: monsterDelta.x, y: monsterDelta.y }

        switch (monsterDelta.m) {
          case 'u': newPosition.y -= 1; break;
          case 'd': newPosition.y += 1; break;
          case 'l': newPosition.x -= 1; break;
          case 'r': newPosition.x += 1; break;
        }

        const initialPosition = monsterPositions[id][0];

        monsterPositions[id].push(newPosition)

        const distance = manhattanDistance(initialPosition, newPosition)
        if (distance > maximiumMonsterDistance[id]) {
          maximiumMonsterDistance[id] = distance;
        }
      }
    }
  }

  console.log(maximiumMonsterDistance);

  fs.writeFileSync('monster_path_results.json', JSON.stringify(monsterPositions));
}

main()
