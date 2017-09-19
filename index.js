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
var rooms = ["room 1", "room 2", "room 3"];

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
  clientInfoEmmiter(currentRoom);

  // console.log(io.sockets.sockets);

  //user sends message
  socket.on('chat message', function(msg){
    io.sockets.in(currentRoom).emit('chat message', socket.name +": " +msg);
    
  });

  //sends client info about the room and people in them
  function clientInfoEmmiter(room) {
    var i = rooms.indexOf(room);
    rooms.splice(i, 1);
    rooms.sort();
    rooms.unshift(room);
    io.sockets.in(room).emit('client info', rooms);
  }

  //changes the current room
  function roomChange(room){
    currentRoom = room;
    socket.join(currentRoom);

    clientInfoEmmiter(currentRoom);
  }
  


  //user is typing
  socket.on('typing', function(data){
    if(data != ""){
      data = socket.name + data;
    }
    io.sockets.in(currentRoom).emit('typing', data);
  }); 

  //changing room
  socket.on('room change', function(room){
    roomChange(room);
  });

  //add room
  socket.on('add room', function(newRoom){
    if(rooms.indexOf(newRoom) == -1 || rooms.length ==5){
      rooms.push(newRoom);
      roomChange(newRoom);
    }
  })


  //socket is disconnected
  socket.on('disconnect', function(msg){
    socket.emit('user disonnected', msg);
  });

});


http.listen(3000, function(){
  console.log('listening on *:3000');
});