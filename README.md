# Snake Game with Raspberry Pi and Web Interface

A classic Snake game implementation that runs simultaneously on a Raspberry Pi's Sense HAT LED matrix and a web interface. The game can be controlled both locally through the Sense HAT's joystick/keyboard and remotely through a web browser.

## Demo
Watch the game in action: [Video Demo](https://youtu.be/2gY3rD08j7w)

## Features
- Play on 8x8 LED matrix (Sense HAT) or web interface
- Wraparound movement (snake appears on opposite side when hitting walls)
- Real-time synchronization between LED matrix and web display
- Multiple control options:
  - Sense HAT joystick
  - Raspberry Pi keyboard (arrow keys)
  - Web interface keyboard controls
- Visual features:
  - Distinct head color (yellow)
  - Apple food sprite
  - Snake face expressions (normal, dead, winning)

## Technologies Used
- Hardware:
  - Raspberry Pi 400
  - Sense HAT
  - Adafruit Cyberdeck HAT (GPIO extender)
- Software:
  - Python
  - Flask (Web framework)
  - Flask-SocketIO (WebSocket implementation)
  - HTML5 Canvas
  - JavaScript
