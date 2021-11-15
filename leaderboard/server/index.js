import express from 'express'
import cors from 'cors'
import axios from 'axios'
import headers from '../../headers.js'
import { join } from 'path'

import { JSONFile, Low } from 'lowdb'

const file = join(process.cwd(), 'db.json')
const adapter = new JSONFile(file)
const db = new Low(adapter)

let data = db.data;

const fillTeamGames = async (teamId) => {
  let page = 0

  while (true) {
    console.log(`Loading games for ${teamId}: page #${page}`)
    const { data: results } = await axios.get(`https://cup.alem.school/api/arena/last_games/${teamId}?skip=${page * 5}&limit=5`, { headers })
    page += 1

    let didAddNewGames = false;
    for (const game of results) {
      if (data[teamId].games.find(g => g.id == game.id)) continue;

      data[teamId].games.push({
        id: game.id,
        time: new Date(new Date(game.created_at).getTime() + 6 * 60 * 60 * 1000),
        status: game.game_status,
        pointDelta: game.delta,
        enemyId: game.enemy_team_id,
        replayId: game.game_session_id,
      })

      didAddNewGames = true;
    }

    if (!didAddNewGames) {
      break;
    }
  }

  data[teamId].games[0].rating = data[teamId].rating;
  for (let i = 1; i < data[teamId].games.length; i++) {
    const game = data[teamId].games[i];

    data[teamId].games[i] = {
      ...game,
      rating: data[teamId].games[i - 1].rating - data[teamId].games[i - 1].pointDelta,
    }
  }
}

const fillTeams = async () => {
  const { data: response } = await axios.get('https://cup.alem.school/api/arena/leaderboard', { headers })

  for (const team of response) {
    data[team.team_id] = {
      rating: team.rating,
      players: team.team.players,
      games: data[team.team_id] ? data[team.team_id].games : [],
    }
  }

  console.log(`Loaded ${response.length} teams`)
}

const scheduler = (callback) => {
  const now = new Date()

  let millis = -1

  for (let i = 0; i < 4; i++) {
    const _millis = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), (i * 15) + 2, 0, 0) - now;

    if (_millis < 0) continue;

    millis = _millis;
    break;
  }

  if (millis === -1) {
    millis = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours() + 1, 2, 0, 0) - now;
  }

  setTimeout(callback, millis)
}

const loop = async () => {
  await db.read()

  data = db.data || {};

  await fillTeams()

  const promises = []

  for (const teamId of Object.keys(data)) {
    promises.push(fillTeamGames(teamId))
  }

  await Promise.all(promises)

  db.data = data;
  await db.write();

  console.log('Team data loaded')
}

const main = async () => {
  await loop()
  scheduler(() => {
    loop()
    scheduler(loop)
  })

  const app = express()

  app.use(cors())

  app.get('/', (req, res) => {
    res.send(data);
  })

  app.listen(3030);
}

main()