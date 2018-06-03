let socket = io();
let id;
let loaded = false;
let cv, ctx;
let WIDTH = 900, HEIGHT = 700;

Promise.all([
  loadSocket(),
  loadGame()
])
.then(data => {
  id = data[0];

  console.log("Loaded successfully!", id);
  listen()
}).catch(err => {
  console.error(err);
})


function loadSocket(){
  return new Promise((res, rej) => {
    socket.on('connect', () => {
      res(socket.id);
    });
  })
}

function loadGame(){
  return new Promise((res, rej) => {
    window.onload = () => {
      cv = document.getElementsByTagName('canvas')[0];
      ctx = cv.getContext('2d');

      res(true);
    }
  })
}

function listen(){
  cv.setAttribute('width', WIDTH);
  cv.setAttribute('height', HEIGHT);

  cv.style.width = WIDTH;
  cv.style.height = HEIGHT;

  ctx.fillStyle = "gray";
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  ctx.fillStyle = "yellow";
  ctx.font = "110px Arial";

  const text = "LOADING...";
  const tW = ctx.measureText(text).width;

  ctx.fillText(text, (WIDTH - tW)/2, HEIGHT/2 + 50);

  socket.on('update', players => {
    ctx.fillStyle = "gray";
    ctx.fillRect(0, 0, WIDTH, HEIGHT);

    let clientPlayer;
    for(let player of players){
      if(player.id === id){
        clientPlayer = player;
        continue;
      }

      drawPlayer(player);
    }

    drawPlayer(clientPlayer, true);
  });
}


function drawPlayer(player, isClient = false){
  ctx.fillStyle = player.color;
  ctx.beginPath();
  ctx.arc(player.x, player.y, 20, 20, 0, Math.PI * 2);
  ctx.fill();

  if(isClient){
    ctx.strokeStyle = "black";
    ctx.lineWidth = "3";
    ctx.beginPath();
    ctx.arc(player.x, player.y, 20, 20, 0, Math.PI * 2);
    ctx.stroke();
  }
}

document.addEventListener('keydown', (e) => {
  socket.emit('keyaction', {
    canMove: true,
    key: e.keyCode
  });

})

document.addEventListener('keyup', (e) => {
  socket.emit('keyaction', {
    canMove: false,
    key: e.keyCode
  });
})
