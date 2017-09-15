var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var express = require('express');
var emoji = require('node-emoji')

app.use(express.static(__dirname + '/images'));

app.get('/', function(req, res){
	res.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket){

  socket.on('chat message', function(msg){
    io.emit('chat message', msg);
  });

  socket.on('disconnect', function(msg){
    io.emit('user disonnected', msg);
  });
});


http.listen(3000, function(){
  console.log('listening on *:3000');
});