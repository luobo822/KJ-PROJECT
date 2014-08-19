var io = require("socket.io").listen(2333);

var users = {};

io.sockets.on("connection", function (socket) {
  io.sockets.emit("connect",{hell:"boy"});
  socket.on("private message", function (from,to,msg) {
    console.log("I received a private message by ", from, " say to ",to, msg);
    if(to in users){ //以to为变量在users遍历
        users[to].emit("to"+to,{mess:msg});
    }
  });
  socket.on("new user",function(data){
     if(data in users){ //以data为变量在users中遍历
         
     }else{
        var nickname = data;
        users[nickname] = socket;
     }
     console.info(users);
  });
  socket.on("disconnect", function () {
    io.sockets.emit("user disconnected");
  });
});