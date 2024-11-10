# Snake game configuration

MATRIX_LENGTH = 8 # DO NOT CHANGE
assert MATRIX_LENGTH == 8, 'Sense HATs have an 8x8 LED Matrix'

def check_rgb(rgb):
    check_length = len(rgb) == 3
    check_type = type(rgb) == tuple or type(rgb) == list
    check_int = 0 <= rgb[0] < 256 and 0 <= rgb[1] < 256 and 0 <= rgb[2] < 256
    return check_length and check_type and check_int

# Colours
SNAKE_COLOUR = (0, 252, 0) # green
HEAD_COLOUR = (248, 252, 0) # yellow
FOOD_COLOUR = (248, 0, 0) # red
BG_COLOUR = (0, 0, 0) # black/off
TEXT_COLOUR = (255, 255, 255) # white
assert check_rgb(SNAKE_COLOUR), 'Must be a valid RGB code (list/tuple, 0-255)'
assert check_rgb(HEAD_COLOUR), 'Must be a valid RGB code (list/tuple, 0-255)'
assert check_rgb(FOOD_COLOUR), 'Must be a valid RGB code (list/tuple, 0-255)'
assert check_rgb(BG_COLOUR), 'Must be a valid RGB code (list/tuple, 0-255)'
assert check_rgb(TEXT_COLOUR), 'Must be a valid RGB code (list/tuple, 0-255)'

# Starting game state
INITIAL_LENGTH = 1
START_X, START_Y = 0, 0
FOOD_START_RANDOMLY = True
FOOD_START_X, FOOD_START_Y = 6, 4
DELAY_S = 0.4
assert INITIAL_LENGTH > 0, 'How can the initial length not be a positive integer'
assert INITIAL_LENGTH + START_X < 8, 'Initial snake is too long or starting location is too far to the right'
assert 0 <= START_X < MATRIX_LENGTH, 'Starting position has to be inside the matrix 0-7'
assert 0 <= START_Y < MATRIX_LENGTH, 'Starting position has to be inside the matrix 0-7'
if not FOOD_START_RANDOMLY:
    assert 0 <= FOOD_START_X < MATRIX_LENGTH, 'Starting position has to be inside the matrix 0-7'
    assert 0 <= FOOD_START_Y < MATRIX_LENGTH, 'Starting position has to be inside the matrix 0-7'
assert 0 < DELAY_S <= 2, 'Delay must be in the range 0-2 seconds'

# As of now, the initial direction is always going to be right

if __name__ == '__main__':
    print('All configurations are set and ready!!')
