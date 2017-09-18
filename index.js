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

  if(!username){
      socket.name = socket.id;
  }
  else{
    socket.name = username;
  }

  socket.join(currentRoom);

  // console.log(io.sockets.sockets);

  var roomData = [];
  roomData.push(currentRoom);


  //user sends message
  socket.on('chat message', function(msg){
    io.sockets.in(currentRoom).emit('chat message', socket.name +": " +msg);
    
  });

  //client data not being rendered properly
  io.sockets.in(currentRoom).emit('client info', roomData);


  //user is typing
  socket.on('typing', function(data){
    if(data != ""){
      data = socket.name + data;
    }
    io.sockets.in(currentRoom).emit('typing', data);
  }); 



  socket.on('disconnect', function(msg){
    socket.emit('user disonnected', msg);
  });

});


http.listen(3000, function(){
  console.log('listening on *:3000');
});