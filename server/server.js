var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var clients = [];
var pairedClients = [];

app.get('/', function(req, res){
    res.sendfile('index.html');
});

app.get('/leapsticks.js', function(req, res){
    res.sendfile('leapsticks.js');
});

app.get('/ai', function(req, res) {
    res.sendfile('ai/index.html');
});
io.on('connection', function(socket){
    clients.push(socket);
    console.log('a user has connected');
    if (clients.length === 2) {
      var randomClient = Math.floor(Math.random() * 2);
      clients[randomClient].emit('startGame', true);
      clients[randomClient === 0 ? 1 : 0].emit('startGame', false);
      pairedClients.push([clients[0], clients[1]]);
      clients = [];
      console.log('two players are now connected, game starting');
    }

    socket.on('disconnect', function() {
      // Find pair of clients to disconnect
      for (i = 0; i < pairedClients.length; ++i) {
        if (pairedClients[i][0] === socket || pairedClients[i][1] === socket) {
          if (pairedClients[i][0] === socket) {
            pairedClients[i][1].emit('endGame', false);
          } else {
            pairedClients[i][0].emit('endGame', false);
          }
          pairedClients = pairedClients.splice(i, 1);
          break;
        }
      }
      console.log('a user has disconnected, game is over');
    });

    socket.on('turn', function(data) {
      // Swap left and right to simplify score keeping on the clients
      data.from = data.from === 'left' ? 'right' : 'left';
      data.to = data.to === 'left' ? 'right' : 'left';
      // Find that socket's pair and update it
      for (i = 0; i < pairedClients.length; ++i) {
        if (pairedClients[i][0] === socket || pairedClients[i][1] === socket) {
          if (pairedClients[i][0] === socket) {
            pairedClients[i][1].emit('update', data);
          } else {
            pairedClients[i][0].emit('update', data);
          }
          break;
        }
      }
    });

    socket.on('endGame', function(isWin) {
      console.log("game ended");
      socket.broadcast.emit('endGame', isWin);
    });
});

http.listen(3000, function(){
    console.log('listening on port 3000');
});
