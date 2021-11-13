const axios = require('axios').default
const fs = require('fs'
)
const headers = {
  'Authorization': 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJray5lcnpoYW5AZ21haWwuY29tIiwidXNlcm5hbWUiOiJrZWtsYW5kIiwiaWQiOjI2MSwiZXhwIjoxNjQ4NjQ0NTE3fQ.601-N9BUvcEbphBj1DG2Y-CLdMso_NObNVy7z0uH-14',
  'Origin': 'https://cup.alem.school',
  'Referer': 'https://cup.alem.school/',
  'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/95.0.4638.69 Safari/537.36',
}

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
