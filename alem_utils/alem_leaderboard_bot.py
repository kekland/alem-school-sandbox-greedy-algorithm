import telebot
import requests
import warnings
import time
import pandas as pd

bot = telebot.TeleBot(token='2116614850:AAFVJogIKQ4zK3mkjRGsLzi12hkSDi9fVBo', skip_pending=True)

def extract_arg(arg):
    return arg.split()[1:]

@bot.message_handler(commands=['lb'])
def show_leaderboard(message):
    user_id = message.chat.id
    res = requests.get('https://cup.alem.school/api/arena/leaderboard', verify=False).json()
    final_text = 'Leaderboard:\n'
    for place,i in enumerate(res):
        final_text+=str(place+1)+'. '
        final_text += '<b>[' + str(i['rating']) + ']</b>\t'
        players = []
        for player in i['team']['players']:
            players.append(player['username'])
        final_text += ', '.join(players)
        final_text += '\t['
        for game in i['last_games']:
            final_text += '<a href="{}">'.format('https://cup.alem.school/main/playback/'+game['game_session_id'])
            if game['status'] == 'WIN':
                final_text+='🟢'
            elif game['status'] == 'LOSE':
                final_text+='🔴'
            else:
                final_text+='🟡'
            final_text+='</a>'
        final_text+=']\n'
    msg = bot.send_message(user_id, text=final_text ,parse_mode='HTML')
    
@bot.message_handler(commands=['stats'])
def get_stats(message):
    user_id = message.chat.id
    try:
        status = int(extract_arg(message.text)[0])
        result_set = []
        i=0
        a = True
        session = requests.Session()
        session.verify = True
        while a:
            try:
                url = 'https://cup.alem.school/api/arena/last_games/{}?skip={}&limit=1000'.format(status, i)
                headers={'Authorization': 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ6dWZpay5pZG9AZ21haWwuY29tIiwidXNlcm5hbWUiOiJadWZjaGFuIiwiaWQiOjIxNCwiZXhwIjoxNjQ4NDg3MTA1fQ.xhqnaoVAkPHpO8HPbpIWzwqmSXihIuKFDkbFkwvRS0Y'}
                r = session.get(url, verify=False,headers=headers).json()
                if r == []:
                    a = False
                    continue
                i+=5
                
                if type(r) != dict:
                    result_set+=r
            except:
                print(r)
                time.sleep(2)

        df = pd.DataFrame(result_set)
        final_mesage = 'Team ' +df['team_logins'][0]+ ' statistics:\n\n'
        games = len(df)
        wins = len(df[df.game_status == 'WIN'])
        loses = len(df[df.game_status == 'LOSE'])
        draws = len(df[df.game_status == 'DRAW'])
        wr = round(100*wins/(games), 2)
        final_mesage += 'TOTAL GAMES: {}\nWINS: {}\nLOSES: {}\nDRAWS: {}\nWIN RATIO: {}%\n\n'.format(games,wins,loses,draws,wr)

        enemies = set(zip(df['enemy_team_logins'], df['enemy_team_id']))
        final_mesage += 'Stats against enemy WINS/LOSES/DRAWS\n\n'
        for enemy, team_id in enemies:

            w = len(df.loc[(df.game_status == 'WIN') & (df.enemy_team_logins==enemy)])
            l = len(df.loc[(df.game_status == 'LOSE') & (df.enemy_team_logins==enemy)])
            d = len(df.loc[(df.game_status == 'DRAW') & (df.enemy_team_logins==enemy)])

            final_mesage += enemy+ ' [' + str(team_id) + ']'' \n{}/{}/{}\n\n'.format(w,l,d)

        msg = bot.send_message(user_id, text=final_mesage,parse_mode='HTML')
    except Exception as e:
        msg = bot.send_message(user_id, text=e.__class__.__name__,parse_mode='HTML')
    

if __name__ == '__main__':
    warnings.filterwarnings("ignore")
    bot.polling(none_stop=True, interval=1)