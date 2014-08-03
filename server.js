var fs = require("fs")
    , http = require("http")
    , socketio = require("socket.io");
 
var server = http.createServer(function(req, res) {
    res.writeHead(200, { "Content-type": "text/html"});
    res.end("please view this page through your app\n");
}).listen(2333, function() {
    console.log("处理register/login/message/main 监听: http://157.7.138.169:2333");
});


 
socketio.listen(server).on("connection", function (socket) {
    socket.on("message", function (msg) {
        console.log("收到消息:", msg);
        socket.broadcast.emit("message", msg);
    });
    socket.on("reg_check_username_server", function (uzn) {
        console.log("收到需检查的用户名:",uzn);
        socket.emit("reg_check_username_client", 1); //这里加入数据库检测，重名发送0，未重名发送1
    });
    socket.on("reg_submit_server", function (data) {
        console.log("收到提交的新用户注册表单对象:\n",data);
        console.log("返回:",data);
        socket.emit("reg_submit_client",data); //如果成功加入数据，返回对象.
    });
});