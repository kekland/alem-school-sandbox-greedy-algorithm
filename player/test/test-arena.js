const axios = require('axios').default
const fs = require('fs')
const chalk = require('chalk')

const solutionFile = './build/bundle.js'
const solutionCode = fs.readFileSync(solutionFile, 'utf8')

const headers = {
  'Authorization': 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJray5lcnpoYW5AZ21haWwuY29tIiwidXNlcm5hbWUiOiJrZWtsYW5kIiwiaWQiOjI2MSwiZXhwIjoxNjQ4NjQ0NTE3fQ.601-N9BUvcEbphBj1DG2Y-CLdMso_NObNVy7z0uH-14',
  'Origin': 'https://cup.alem.school',
  'Referer': 'https://cup.alem.school/',
  'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/95.0.4638.69 Safari/537.36',
}

const sendSolution = async (level) => {
  const response = await axios.post('https://cup.alem.school/api/ondemand/send_solution', {
    code: solutionCode,
    lang: 'js',
    mode: 'SELF'
  }, { headers })

  const key = response.data

  while (true) {
    const finishedResponse = await axios.get(`https://cup.alem.school/api/game/logs/${key}`, { headers })

    if (finishedResponse.data.finished) {
      break;
    }

    await new Promise(resolve => setTimeout(resolve, 1000))
  }

  const { data: gameResult } = await axios.get(`https://s3.alem.school/storage/gamesessions/${key}.json`, { headers })

  const totalCoins = gameResult.initial_state.coins.length;
  let collectedCoins = 0;

  for (const frame of gameResult.frames) {
    for (const diff of frame.d) {
      if (diff.n === '#') {
        collectedCoins = diff.p[0].c
      }
    }
  }

  const didTimeout = gameResult.frames.some((v) => v.e.some((v) => v.v === 'timeout'))

  return {
    level,
    status: gameResult.frames.length === 300 ? 'win' : 'loss',
    frames: gameResult.frames.length,
    totalCoins,
    collectedCoins,
    didTimeout,
    key,
  }
}

const main = async () => {
  console.log('')
  console.log(chalk.green('Solution loaded'));

  let passes = 0
  let fails = 0
  let failsByDeath = 0

  let _collectedCoins = 0
  let _totalCoins = 0

  let _passTicks = 0

  for (let i = 0; i < 10; i++) {
    const level = 5
    console.log(chalk.gray(`Run #${i}: `));
    const result = await sendSolution(level);

    let responseStr = ''

    if (result.status === 'win') {
      responseStr += chalk.green('Pass')
      responseStr += chalk.white(', ticks: ')
      responseStr += chalk.white(result.frames)

      passes += 1
      _passTicks += result.frames
    }
    else {
      responseStr += (result.didTimeout || result.frames < 300) ? chalk.bgRed('Fail') : chalk.yellow('Fail')
      responseStr += chalk.white(', ticks: ')
      responseStr += chalk.white(result.frames)

      if (result.didTimeout) {
        responseStr += ' '
        responseStr += chalk.bgRed('TIMEOUT')
      }

      if (result.frames < 300) {
        responseStr += ' '
        responseStr += chalk.bgRed('DEATH')
        failsByDeath += 1
      }
      else {
        fails += 1
      }
    }


    responseStr += '\n'

    responseStr += chalk.white('Coins: ')
    responseStr += chalk.green(result.collectedCoins)
    responseStr += chalk.gray('/')
    responseStr += chalk.green(result.totalCoins)

    _collectedCoins += result.collectedCoins
    _totalCoins += result.totalCoins

    responseStr += '\n'
    responseStr += chalk.gray(`https://cup.alem.school/main/playback/${result.key}`)

    console.log(responseStr)
    console.log('')

    await new Promise(resolve => setTimeout(resolve, 2000))
  }

  console.log('')
  console.log(chalk.gray('Results'))
  console.log('Passes: ' + chalk.green(passes) + chalk.gray('/10'))
  console.log('Fails: ' + chalk.yellow(fails) + chalk.gray('/10'))
  console.log('Deaths: ' + chalk.red(failsByDeath) + chalk.gray('/10'))

  console.log('')
  console.log(chalk.white('Coins: ' + chalk.green(_collectedCoins) + chalk.gray('/') + chalk.green(_totalCoins)))
  console.log(chalk.white('Avg. ticks per pass: ' + chalk.green(_passTicks / passes)))
}

main()
