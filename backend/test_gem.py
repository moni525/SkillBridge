import os
import google.generativeai as genai

genai.configure(api_key='AIzaSyAFzrqp7Zm__C5dGF0O2JtEId8aUUzEwzc')
model = genai.GenerativeModel('gemini-1.5-flash')
try:
    response = model.generate_content('Hello')
    print('OUTPUT:', response.text)
except Exception as e:
    print('ERROR:', e)
