from flask import Flask, render_template, url_for
from flask_socketio import SocketIO
from pynput.keyboard import Controller, Key
from snake import start_game, finish_game
from snake_config import SNAKE_COLOUR, HEAD_COLOUR, FOOD_COLOUR
from sense_hat import SenseHat

app = Flask(__name__)
app.config['SECRET_KEY'] = 'super secret key :D'
socketio = SocketIO(app)

@app.route('/')
def index():
    return render_template('index.html', canvas_length=480)

# A client first connects
@socketio.on('connect')
def handle_connect():
    preparation_data = {
        'snake_colour' : SNAKE_COLOUR,
        'head_colour' : HEAD_COLOUR,
        'food_colour' : FOOD_COLOUR,
        'current_state' : SenseHat().get_pixels(),
        'game_running' : game_running
    }
    socketio.emit('current_state', preparation_data)

# To make sure a game can only be started when it's not running
game_running = False

def game_ended(snake_length, data):
    global game_running
    game_running = False
    socketio.emit('game_ended', data)
    message =  f'YOU WON!' if data['win'] else f'Length: {snake_length}'
    socketio.emit('display_message', message + '<br>Press start to play again!')
    socketio.start_background_task(finish_game, snake_length)

# A client pressed the 'start' button
@socketio.on('start')
def handle_start():
    global game_running

    print('Received start')
    if not game_running:
        print('Starting Game!')
        socketio.emit('display_message', '')
        game_running = True
        socketio.start_background_task(start_game, socketio, game_ended)
    else:
        print('Game already started!')
        socketio.emit('display_message', 'Game already started!')


# Receive movement from client(s)

keyboard = Controller()
@socketio.on('up')
def up():
    keyboard.press(Key.up)
    keyboard.release(Key.up)

@socketio.on('down')
def down():
    keyboard.press(Key.down)
    keyboard.release(Key.down)

@socketio.on('left')
def left():
    keyboard.press(Key.left)
    keyboard.release(Key.left)

@socketio.on('right')
def right():
    keyboard.press(Key.right)
    keyboard.release(Key.right)

if __name__ == '__main__':
    socketio.run(app, log_output=True, host='0.0.0.0')