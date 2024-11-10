from collections import deque
from pynput.keyboard import Listener, Key
from random import choice
from sense_hat import SenseHat
from snake_config import *
from time import sleep

class DummyClass():
    def __init__(self) -> None:
        pass

    def emit(self, msg, data):
        print(msg, data)

    def sleep(self, delay):
        sleep(delay)

dummy = DummyClass()

def dummy_function(*args):
    pass

def start_game(socketio=dummy, game_ended=dummy_function):
    sense = SenseHat()
    snake_length = 0
    has_moved = False
    # game_running = True

    # Keyboard events
    def on_press_key(key):
        nonlocal has_moved, speed_x, speed_y

        if not has_moved:
            return
        if key == Key.up and not speed_y:
            speed_x, speed_y = 0, -1
        elif key == Key.down and not speed_y:
            speed_x, speed_y = 0, 1
        elif key == Key.left and not speed_x:
            speed_x, speed_y = -1, 0
        elif key == Key.right and not speed_x:
            speed_x, speed_y = 1, 0
        has_moved = False

    listener = Listener(on_press=on_press_key)

    # Implementation variables
    snake_body = deque()
    free_space = set((i, j) for i in range(MATRIX_LENGTH) for j in range(MATRIX_LENGTH))
    food_x, food_y = FOOD_START_X, FOOD_START_Y
    speed_x, speed_y = 1, 0 # right
    has_moved = False
    snake_length = INITIAL_LENGTH # aka the score
    listener.start()

    # Set background
    sense.set_pixels([BG_COLOUR] * MATRIX_LENGTH * MATRIX_LENGTH)

    # Generate snake body and turn on snake's LEDs
    for segment in range(INITIAL_LENGTH):
        x, y = START_X + segment, START_Y
        free_space.remove((x, y))
        snake_body.append((x, y))
        sense.set_pixel(x, y, SNAKE_COLOUR)
    sense.set_pixel(START_X + INITIAL_LENGTH - 1, START_Y, HEAD_COLOUR)

    # Set food location and turn on food's LED
    if FOOD_START_RANDOMLY:
        food_x, food_y = choice(tuple(free_space))
    sense.set_pixel(food_x, food_y, FOOD_COLOUR)

    initial_state = {
        'initial_food_x' : food_x,
        'initial_food_y' : food_y,
        'initial_length' : INITIAL_LENGTH,
        'initial_snake_x' : START_X,
        'initial_snake_y' : START_Y
    }
    socketio.emit('initial_state', initial_state)

    # Game loop
    while True:
        socketio.sleep(DELAY_S)

        # Move Head
        prev_head_x, prev_head_y = snake_body[-1]
        tail_x, tail_y = snake_body[0]

        # Current speed_x and speed_y, useful for send socket
        direction_x, direction_y = speed_x, speed_y

    
        head_x = (prev_head_x + direction_x) % MATRIX_LENGTH
        head_y = (prev_head_y + direction_y) % MATRIX_LENGTH

        # Snake eats food
        ate_food = head_x == food_x and head_y == food_y
        if ate_food:
            snake_length += 1

            # Snake fills entire grid
            if snake_length == MATRIX_LENGTH * MATRIX_LENGTH: 
                snake_body.append((head_x, head_y))
                break
            free_space.remove((head_x, head_y))
            food_x, food_y = choice(list(free_space))
        else: # Snake doesn't eat food
            snake_body.popleft()
            free_space.add((tail_x, tail_y))

            # Snake bumps itself
            if (head_x, head_y) not in free_space:
                break

            free_space.remove((head_x, head_y))


        # Implementation as the result of head moving
        snake_body.append((head_x, head_y))
        has_moved = True

        # Show the move in the matrix
        sense.set_pixel(prev_head_x, prev_head_y, SNAKE_COLOUR)
        if ate_food:
            sense.set_pixel(food_x, food_y, FOOD_COLOUR)
        else:
            sense.set_pixel(tail_x, tail_y, BG_COLOUR)
        sense.set_pixel(head_x, head_y, HEAD_COLOUR)

        # Send socket
        game_state = {
            'prev_head_x' : prev_head_x,
            'prev_head_y' : prev_head_y,
            'head_x' : head_x,
            'head_y' : head_y,
            'tail_x' : tail_x,
            'tail_y' : tail_y,
            'food_x' : food_x,
            'food_y' : food_y,
            'ate_food' : ate_food,
            'direction_x' : direction_x,
            'direction_y' : direction_y
        }
        socketio.emit('game_loop', game_state)

    # Game finished, stop listening, output score (in clients and server), emit socket(s)
    listener.stop()
    print('Game finished!')
    print(f'Length: {snake_length}')

    head_x, head_y = snake_body[-1]
    neck_x, neck_y = snake_body[-2]
    game_ended_data = {
        'win' : snake_length == MATRIX_LENGTH * MATRIX_LENGTH,
        'direction_x' : speed_x,
        'direction_y' : speed_y,
        'head_x' : head_x,
        'head_y' : head_y,
        'neck_x' : neck_x,
        'neck_y' : neck_y
    }
    game_ended(snake_length, game_ended_data) # see app.py, to understand more
    return snake_length

# Display the score using show_message
def finish_game(length):
    sense = SenseHat()
    sense.show_message(str(length), text_colour=TEXT_COLOUR, back_colour=BG_COLOUR)
    if length == MATRIX_LENGTH * MATRIX_LENGTH:
        sense.show_message('YOU WON! CONGRATULATIONS!', text_colour=TEXT_COLOUR, back_colour=BG_COLOUR)
        print('YOU WON! CONGRATULATIONS!')
    sense.clear(BG_COLOUR)

if __name__ == '__main__':
    finish_game(start_game())