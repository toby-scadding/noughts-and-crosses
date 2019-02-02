var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var playersWaiting = [];

io.on('connection', function(socket){
    if (playersWaiting.length === 0) {
        playersWaiting.push(socket.id);
    } else {
        opponent = playersWaiting.shift();
        socket.emit('opponent found', opponent, 'O', false);
        io.to(opponent).emit('opponent found', socket.id, 'X', true);
    }

    socket.on('make move', function(squares, opponent){
        io.to(opponent).emit('make move', squares);
    });
});

http.listen(4001, function(){
    console.log('listening on *:4001');
});