var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var connectedPlayers = 0;

app.get('/', function(req, res){
    res.sendfile('index.html');
});

io.on('connection', function(socket){
    connectedPlayers = connectedPlayers + 1;
    console.log('a user has connected');

    socket.on('disconnect', function() {
      connectedPlayers = connectedPlayers - 1;
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
