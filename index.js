var app = require('express')();
var bodyParser = require('body-parser');
var http = require('http').Server(app);
var io = require('socket.io')(http);
var express = require('express');
var emoji = require('node-emoji')

app.use(express.static(__dirname + '/images'));
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies


var username; 
var rooms = ["room1"];

app.get('/', function(req, res){
	res.sendFile(__dirname + '/welcome_page.html');
});

app.post('/homepage', function(req, res){
  username = req.body.user.name;
  res.sendFile(__dirname + '/index.html');
});



io.on('connection', function(socket){

  var currentRoom = rooms[0];
  socket.join(currentRoom);

  socket.on('create', function (room) {
    console.log(room);
  });

  socket.on('chat message', function(msg){
  	// socket.emit('news', {hello: 'world'});
    if(!username){
      username = "me";
    }
    io.sockets.in(currentRoom).emit('chat message', username +": " +msg);
  });

  socket.on('disconnect', function(msg){
    socket.emit('user disonnected', msg);
  });

});


http.listen(3000, function(){
  console.log('listening on *:3000');
});