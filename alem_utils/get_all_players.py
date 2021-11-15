import pandas as pd 
import requests
import warnings
warnings.filterwarnings("ignore")

headers={'Authorization': 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ6dWZpay5pZG9AZ21haWwuY29tIiwidXNlcm5hbWUiOiJadWZjaGFuIiwiaWQiOjIxNCwiZXhwIjoxNjQ4NDg3MTA1fQ.xhqnaoVAkPHpO8HPbpIWzwqmSXihIuKFDkbFkwvRS0Y'}

def get_main_info(i):
    data = requests.get('https://cup.alem.school/api/players/{}'.format(i),
                        verify = False, headers = headers).json()
#     username = data['username'],
#     team_id = data['team']['id']
#     citizenship = data['citizenship']
#     captain = data['team']['captain_id']
    return data

def get_success_levels(i):
    data = requests.get('https://cup.alem.school/api/sandbox/get_success_levels/{}'.format(i),
                        verify = False, headers = headers).json()
    return len(data)

def get_arena_stats(i):
    data = requests.get('https://cup.alem.school/api/arena/stats/{}'.format(i),
                        verify = False, headers = headers).json()
# created_at: "2021-11-13T19:09:31.860129"
# draws: 18
# lang: "js"
# loses: 221
# wins: 230
    return data

user_id = []
username = []
team_id = []
email = []
citizenship = []
captain = []
success_levels = []
created_at = []
lang = []
wins = []
loses = []
draws = []

for i in range(1,500):
    if i%100==0:
        print(i)

    data1 = get_main_info(i)
    if 'detail' in data1.keys():
            if data1['detail'] == 'Пользователь не найден':
                continue
    
    username.append(data1['username'])
          
    citizenship.append(data1['citizenship'])
    
    email.append(data1['email'])
    
    if data1['team'] != None:
        team_id.append(data1['team']['id'])
        captain.append(data1['team']['captain_id'])
        success_levels.append(get_success_levels(i))
        data2 = get_arena_stats(data1['team']['id'])
        created_at.append(data2['created_at'])
        lang.append(data2['lang'])
        wins.append(data2['wins'])
        loses.append(data2['loses'])
        draws.append(data2['draws'])
    else:
        team_id.append(None)
        captain.append(None)
        success_levels.append(None)
        created_at.append(None)
        lang.append(None)
        wins.append(None)
        loses.append(None)
        draws.append(None)
        
    user_id.append(data1['id'])

df = pd.DataFrame()
df['user_id'] = user_id
df['username'] = username
df['email'] = email
df['team_id'] = team_id
df['citizenship'] = citizenship
df['captain'] = captain
df['success_levels'] = success_levels
df['created_at'] = created_at
df['lang'] = lang
df['wins'] = wins
df['loses'] = loses
df['draws'] = draws

df.to_excel('all_registered.xlsx')