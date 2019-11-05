var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var playersWaiting = [];
var opponents = {};

io.on('connection', function(socket){
    console.log('New connection: ' + socket.id);

    socket.on('waiting', function(){
        if (playersWaiting.length === 0) {
            playersWaiting.push(socket.id);
        } else {
            let opponent = playersWaiting.shift();
            opponents[socket.id] = opponent;
            opponents[opponent] = socket.id;

            socket.emit('opponent found', 'O', false);
            io.to(opponent).emit('opponent found', 'X', true);
        }
    });

    socket.on('make move', function(squares){
        let opponent = opponents[socket.id];
        io.to(opponent).emit('make move', squares);
    });

    socket.on('disconnect', function(){
        let opponent = opponents[socket.id];
        if (!opponent) {
            let index = playersWaiting.indexOf(socket.id);
            if (index > -1) {
                playersWaiting.splice(index, 1);
            }
        } else {
            delete opponents[socket.id];
            delete opponents[opponent];

            io.to(opponent).emit('opponent disconnected');
        }
    });
});

http.listen(3001, function(){
    console.log('listening on *:3001');
});