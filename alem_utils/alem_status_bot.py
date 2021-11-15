import requests
import time
import warnings

def write_to_bot(message):
    token = '2116570398:AAF0EdFRcOk0k1vUZVcbQ3-T2oz0NXobHNg'
    chat_id = '-744838696'
    url = 'https://api.telegram.org/bot{}/sendMessage?chat_id={}&text={}'
    requests.post(url.format(token,chat_id,message))

warnings.filterwarnings("ignore")
a = True
ratings = {}
places = {}

while a:
    res = requests.get('https://cup.alem.school/api/arena/leaderboard', verify=False).json()
    final_text = 'Leaderboard Changes:\n'
    for place,i in enumerate(res):
        score_diff=0
        
        if i['team_id'] in ratings.keys():
            score_diff = i['rating'] - ratings[i['team_id']]
        ratings[i['team_id']] = i['rating']
        
        old_place = 0
        if i['team_id'] in places.keys():
            old_place = places[i['team_id']]
        places[i['team_id']] = place+1
        
        if old_place >0 and old_place != place+1:       
            final_text+=str(old_place) + '->' + str(place+1)+'. '
        else:
            final_text+= str(place+1)+'. '
        
        final_text += '[' + str(i['rating']) 
        
        if score_diff>0:
            score_diff = ' (+'+str(score_diff)+')] '
        else:
            score_diff = ' ('+str(score_diff)+')] '
        final_text += score_diff
        
        players = []
        for player in i['team']['players']:
            players.append(player['username'])
        final_text += ', '.join(players)
        final_text+='\n'
    write_to_bot(final_text)
    time.sleep(60*15)
    