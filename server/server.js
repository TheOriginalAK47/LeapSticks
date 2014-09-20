var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var clients = [];
var connectedPlayers = 0;

app.get('/', function(req, res){
    res.sendfile('index.html');
});

io.on('connection', function(socket){
    connectedPlayers = connectedPlayers + 1;
    clients.push(socket);
    console.log('a user has connected');
    if (connectedPlayers === 2) {
      var randomClient = Math.floor(Math.random() * connectedPlayers);
      // startGame === true -> first player
      clients[randomClient].emit('startGame', true);
      clients[randomClient === 0 ? 1 : 0].emit('startGame', false);
      console.log('two players are now connected, game starting');
    }

    socket.on('disconnect', function() {
      connectedPlayers = connectedPlayers - 1;

      // Delete socket from clients[]
      var i = clients.indexOf(socket);
      if(i != -1) {
          clients.splice(i, 1);
      }

      socket.broadcast.emit('endGame', '');
      console.log('a user has disconnected');
    });

    // Turn is either an attack or split. 
    // data = {
    //  move: "",
    //  from: "",
    //  to: ""
    // }
    socket.on('turn', function(data) {
      socket.brodcast.emit('update', data); 
    });
});

http.listen(3000, function(){
    console.log('listening on *:3000');
});
