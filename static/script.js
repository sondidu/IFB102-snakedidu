// Snake constants (even though I'm using var lol)
const matrix_length = 8;
var snake_colour;
var head_colour;
var food_colour;

// Canvas constants
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const square_length = canvas.width / matrix_length;
console.log(canvas.width, square_length);

const socket = io();

socket.on("connect", function() {
    console.log("connect!");
    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("keyup", handleKeyUp);
});

/*
 *  preparation_data = {
 *      'snake_colour' : SNAKE_COLOUR,
 *      'head_colour' : HEAD_COLOUR,
 *      'food_colour' : FOOD_COLOUR,
 *      'current_state' : SenseHat().get_pixels(),
 *      'game_running' : game_running
 *  }
 */

// Socket that handles the state of the game
// May be midgame or not midgame
// Received socket usually after connect
socket.on("current_state", function(prep_data) {
    console.log("current_state!");
    snake_colour = rgb(prep_data.snake_colour);
    head_colour = rgb(prep_data.head_colour);
    food_colour = rgb(prep_data.food_colour);

    if (prep_data.game_running) {
        drawEntireCanvas(prep_data.current_state);
    }
});

// Start button
document.getElementById("start-button").onclick = function() {
    console.log("emitted and pressed 'start'");
    // document.getElementById("score").innerHTML = "";
    socket.emit("start");
}

// Handle Keyboard events
let keys = {
    ArrowLeft: false,
    ArrowUp: false,
    ArrowRight: false,
    ArrowDown: false
}

function handleKeyDown(event) {
    if (keys[event.key]) {
        return
    }
    switch (event.key) {
        case "ArrowUp":
            console.log("Up");
            socket.emit("up");
            break;
        case "ArrowDown":
            console.log("Down");
            socket.emit("down");
            break;
        case "ArrowLeft":
            console.log("Left");
            socket.emit("left");
            break;
        case "ArrowRight":
            console.log("Right");
            socket.emit("right");
            break;
    }
    keys[event.key] = true;
}

function handleKeyUp(event) {
    keys[event.key] = false;
}


/*
 *  initial_state = {
 *      'initial_food_x' : food_x,
 *      'initial_food_y' : food_y,
 *      'initial_length' : INITIAL_LENGTH,
 *      'initial_snake_x' : START_X,
 *      'initial_snake_y' : START_Y
 *  }
 */

// Socket that handles the initial state before the game started
socket.on("initial_state", function(data) {
    console.log("initial_state received");
    eraseEntireCanvas();
    for (let i = 0; i < data.initial_length - 1; i++) {
        drawSquare(data.initial_snake_x + i, data.initial_snake_y, snake_colour);
    }
    drawSquare(data.initial_snake_x + data.initial_length - 1, data.initial_snake_y, head_colour);
    drawEyes(data.initial_snake_x + data.initial_length - 1, data.initial_snake_y, 1, 0);
    drawApple(data.initial_food_x, data.initial_food_y);
});

/*
 *  game_state = {
 *      'prev_head_x' : prev_head_x,
 *      'prev_head_y' : prev_head_y,
 *      'head_x' : head_x,
 *      'head_y' : head_y,
 *      'tail_x' : tail_x,
 *      'tail_y' : tail_y,
 *      'food_x' : food_x,
 *      'food_y' : food_y,
 *      'ate_food' : ate_food,
 *      'direction_x' : direction_x,
 *      'direction_y' : direction_y
 *  }
 */

// Socket that updates the snake everytime it moves
socket.on("game_loop", function(data) {
    console.log("game_loop received");
    drawSquare(data.prev_head_x, data.prev_head_y, snake_colour);
    if (data.ate_food) {
        drawApple(data.food_x, data.food_y);
    } else {
        erase(data.tail_x, data.tail_y);
    }

    // Draws head and eyes
    drawSquare(data.head_x, data.head_y, head_colour);
    drawEyes(data.head_x, data.head_y, data.direction_x, data.direction_y);
});

// Socket to display a message
socket.on("display_message", function(message) {
    document.getElementById("score").innerHTML = message;
});

/*
 * game_ended_data = {
 *     'win' : snake_length == MATRIX_LENGTH * MATRIX_LENGTH,
 *     'direction_x' : speed_x,
 *     'direction_y' : speed_y,
 *     'head_x' : head_x,
 *     'head_y' : head_y,
 *     'neck_x' : neck_x,
 *     'neck_y' : neck_y
 * }
 */

// Socket when game ends
socket.on("game_ended", function(data) {
    drawSquare(data.head_x, data.head_y, head_colour);
    if (data.win) {
        console.log('win :D');
        drawSquare(data.neck_x, data.neck_y, snake_colour);
        drawHappyEyes(data.head_x, data.head_y, data.direction_x, data.direction_y);
    } else {
        console.log('dead XD');
        drawDeadEyes(data.head_x, data.head_y, data.direction_x, data.direction_y);
    }
});

// Everything below are just functions, mostly for drawing :)

function rgb(arr) {
    return `rgb(${arr[0]}, ${arr[1]}, ${arr[2]})`;
}

// x and y are not pixel x's and y's but
// grid x's and y's
function drawSquare(x, y, colour) {
    ctx.fillStyle = colour;
    ctx.fillRect(x * square_length, y * square_length, square_length, square_length);
}

// coordinates are the center of the circle
function drawCircle(x, y, diameter, colour) {
    ctx.beginPath();
    ctx.arc(x, y, diameter / 2, 0, 2 * Math.PI)
    ctx.fillStyle = colour;
    ctx.fill()
}


const line_width = 3;
// (x, y) are actual x and y pixels
function drawLine(x1, y1, x2, y2) {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.lineWidth = line_width;
    ctx.stroke();
}

// Draws a literal 'X' at the center (x, y)
// horizontal_length is horizontal length
function drawX(x, y, horizontal_length) {
    // Top left to bottom right
    drawLine(x - horizontal_length / 2, y - horizontal_length / 2, x + horizontal_length / 2, y + horizontal_length / 2);

    // Top right to bottom left
    drawLine(x + horizontal_length / 2, y - horizontal_length / 2, x - horizontal_length / 2, y + horizontal_length / 2);
}

// Draws a single '^' based on the direction
// length is the distance from center to the middle point of '^'
function drawHappyEye(center_x, center_y, direction_x, direction_y, length) {
    // Setting up points
    let middle_x = center_x - length * direction_x;
    let middle_y = center_y + length * direction_y;
    let left_x = center_x - length * direction_y;
    let left_y = center_y + length * direction_x;
    let right_x = center_x + length * direction_y;
    let right_y = center_y - length * direction_x;

    // Drawing the line from left -> middle -> right
    ctx.beginPath();
    ctx.moveTo(left_x, left_y);
    ctx.lineTo(middle_x, middle_y);
    ctx.lineTo(right_x, right_y);
    ctx.lineWidth = line_width;
    ctx.stroke();
}

// draw the eyes based on the given directions
function drawEyes(x, y, direction_x, direction_y) {
    let left_bd = x * square_length; // bd = border
    let top_bd = y * square_length;
    let white_d = square_length / 2; // d = diameter
    let black_d = square_length / 4;
    let white_center_x;
    let white_center_y;

    // Draw top left eye
    if (direction_x === -1 || direction_y === -1) {
        white_center_x = left_bd + square_length / 4;
        white_center_y = top_bd + square_length / 4;
        drawCircle(white_center_x, white_center_y, white_d, "white");
        drawCircle(white_center_x + direction_x * black_d * 0.3, white_center_y + direction_y * black_d * 0.3, black_d, "black");
    }

    // Draw bottom left eye
    if (direction_x === -1 || direction_y === 1) {
        white_center_x = left_bd + square_length / 4;
        white_center_y = top_bd + square_length * 0.75;
        drawCircle(white_center_x, white_center_y, white_d, "white");
        drawCircle(white_center_x + direction_x * black_d * 0.3, white_center_y + direction_y * black_d * 0.3, black_d, "black");
    }

    // Draw top right eye
    if (direction_x === 1 || direction_y === -1) {
        white_center_x = left_bd + square_length * 0.75;
        white_center_y = top_bd + square_length / 4;
        drawCircle(white_center_x, white_center_y, white_d, "white");
        drawCircle(white_center_x + direction_x * black_d * 0.3, white_center_y + direction_y * black_d * 0.3, black_d, "black");
    }

    // Draw bottom right eye
    if (direction_x === 1 || direction_y === 1) {
        white_center_x = left_bd + square_length * 0.75;
        white_center_y = top_bd + square_length * 0.75;
        drawCircle(white_center_x, white_center_y, white_d, "white");
        drawCircle(white_center_x + direction_x * black_d * 0.3, white_center_y + direction_y * black_d * 0.3, black_d, "black");
    }
}

// Draw dead eyes based on the given directions
function drawDeadEyes(x, y, direction_x, direction_y) {
    let left_bd = x * square_length; // bd = border
    let top_bd = y * square_length;
    let white_d = square_length / 2;
    let horizontal_length = white_d / 2 * Math.sqrt(2) * 0.75;
    let center_x;
    let center_y;

    // Draw top left eye
    if (direction_x === -1 || direction_y === -1) {
        center_x = left_bd + square_length / 4;
        center_y = top_bd + square_length / 4;
        drawCircle(center_x, center_y, white_d, "white");
        drawX(center_x, center_y, horizontal_length);
    }

    // Draw bottom left eye
    if (direction_x === -1 || direction_y === 1) {
        center_x = left_bd + square_length / 4;
        center_y = top_bd + square_length * 0.75;
        drawCircle(center_x, center_y, white_d, "white");
        drawX(center_x, center_y, horizontal_length);
    }

    // Draw top right eye
    if (direction_x === 1 || direction_y === -1) {
        center_x = left_bd + square_length * 0.75;
        center_y = top_bd + square_length / 4;
        drawCircle(center_x, center_y, white_d, "white");
        drawX(center_x, center_y, horizontal_length);
    }

    // Draw bottom right eye
    if (direction_x === 1 || direction_y === 1) {
        center_x = left_bd + square_length * 0.75;
        center_y = top_bd + square_length * 0.75;
        drawCircle(center_x, center_y, white_d, "white");
        drawX(center_x, center_y, horizontal_length);
    }
}

// Draw happy eyes, x and y are grid-coordinates
function drawHappyEyes(x, y, direction_x, direction_y) {
    let left_bd = x * square_length; // bd = border
    let top_bd = y * square_length;
    let white_d = square_length / 2; // d = diameter
    let white_center_x;
    let white_center_y;
    let happy_eye_length = white_d * 0.3;

    // Draw top left eye
    if (direction_x === -1 || direction_y === -1) {
        white_center_x = left_bd + square_length / 4;
        white_center_y = top_bd + square_length / 4;
        drawCircle(white_center_x, white_center_y, white_d, "white");
        drawHappyEye(white_center_x, white_center_y, direction_x, direction_y, happy_eye_length);
    }

    // Draw bottom left eye
    if (direction_x === -1 || direction_y === 1) {
        white_center_x = left_bd + square_length / 4;
        white_center_y = top_bd + square_length * 0.75;
        drawCircle(white_center_x, white_center_y, white_d, "white");
        drawHappyEye(white_center_x, white_center_y, direction_x, direction_y, happy_eye_length);
    }

    // Draw top right eye
    if (direction_x === 1 || direction_y === -1) {
        white_center_x = left_bd + square_length * 0.75;
        white_center_y = top_bd + square_length / 4;
        drawCircle(white_center_x, white_center_y, white_d, "white");
        drawHappyEye(white_center_x, white_center_y, direction_x, direction_y, happy_eye_length);
    }

    // Draw bottom right eye
    if (direction_x === 1 || direction_y === 1) {
        white_center_x = left_bd + square_length * 0.75;
        white_center_y = top_bd + square_length * 0.75;
        drawCircle(white_center_x, white_center_y, white_d, "white");
        drawHappyEye(white_center_x, white_center_y, direction_x, direction_y, happy_eye_length);
    }
}

const apple_image = new Image();
apple_image.src = "/static/apple.png";
function drawApple(x, y) {
    ctx.drawImage(apple_image, x * square_length, y * square_length, square_length, square_length);
}

function erase(x, y) {
    ctx.clearRect(x * square_length, y * square_length, square_length, square_length);
}

function drawEntireCanvas(matrix) {
    for (let i = 0; i < matrix.length; i++) {
        let colour = rgb(matrix[i]);
        let x = i % 8;
        let y = Math.floor(i / 8);
        if (colour != food_colour) {
            drawSquare(x, y, colour);
        } else {
            drawApple(x, y);
        }
    }
}

function eraseEntireCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}
