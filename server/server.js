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
            pairedClients[i][1].emit('endGame', '');
          } else {
            pairedClients[i][0].emit('endGame', '');
          }
          pairedClients = pairedClients.splice(i, 1);
          break;
        }
      }
      console.log('a user has disconnected, game is over');
    });

    // Turn is either an attack or split.
    // data = {
    //  move: "",
    //  from: "",
    //  to: ""
    // }
    socket.on('turn', function(data) {
      // Swap left and right to simplify score keeping on the clients
      var temp = data.from;
      data.from = data.to;
      data.to = temp;
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
});

http.listen(3000, function(){
    console.log('listening on port 3000');
});
