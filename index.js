const express = require('express')

const app = express()
const server = require('http').createServer(app)
const sio = require('socket.io').listen(server)
const port = process.env.PORT || 3000

app.set('view engine', 'ejs')
app.use('/css', express.static('css'))
app.use('/js', express.static('js'))

app.get("/", (req, res) => {
  res.render('site')
})

server.listen(port, () => console.log("Server is listening at " + port + "!"))

let allSockets = [];
let allPlayers = [];

function createPlayer(id){
  const player = {
    pos: {
      x: Math.random() * 500,
      y: Math.random() * 500
    },
    id: id,
    color: `hsl(${~~(Math.random() * 360)}, 100%, 50%)`,
    size: 20,
    speed: 10,
    moveRight: false,
    moveLeft: false,
    moveUp: false,
    moveDown: false,

    move(){
      if(this.moveRight)
        this.pos.x += this.speed;
      if(this.moveLeft)
        this.pos.x -= this.speed;
      if(this.moveDown)
        this.pos.y += this.speed;
      if(this.moveUp)
        this.pos.y -= this.speed;
    }
  }

  return player;
}

sio.on('connection', socket => {
  const id = socket.id;
  allPlayers[id] = createPlayer(id);
  allSockets[id] = socket;

  console.log(id + " connected");
  socket.on('disconnect', () => {
    delete allPlayers[id];
    delete allSockets[id];

    console.log(id + " disconnected");
  })

  socket.on('keyaction', data => {
    let player = allPlayers[id];

    // W 87  A 65  S 83  D 68
    if(data.key == 68 && !player.moveLeft)
      player.moveRight = data.canMove;
    if(data.key == 65 && !player.moveRight)
      player.moveLeft = data.canMove;

    if(data.key == 87 && !player.moveDown)
      player.moveUp = data.canMove;
    if(data.key == 83 && !player.moveUp)
      player.moveDown = data.canMove;
  })
});

setInterval(() => {
  let pack = [];

  for(let i in allPlayers){
    let player = allPlayers[i];
    player.move()

    pack.push({
      x: player.pos.x,
      y: player.pos.y,
      color: player.color,
      id: player.id
    });
  }

  for(let id in allSockets){
    allSockets[id].emit('update', pack)
  }
}, 1000/30);
