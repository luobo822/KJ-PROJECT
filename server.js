var fs = require("fs")
    , http = require("http")

var inspect = require('util').inspect;
var socketio = require("socket.io");
var Client = require('mariasql');
var c = new Client();

    

var server = http.createServer(function(req, res) {
    res.writeHead(200, { "Content-type": "text/html"});
    res.end("please view this page through your app\n");
}).listen(2333, function() {
    console.log("处理register/login/message/main 监听: http://157.7.138.169:2333");    
});

    c.connect({
      host: 'localhost',
      user: 'root',
      password: 'coco0929',
      db: 'moe'
    });

    c.on('connect', function() {
        console.log('数据库连接开始');
    })
    .on('error', function(err) {
        console.log('数据库连接错误: ' + err);
    })
    .on('close', function(hadError) {
        console.log('数据库连接关闭');
    });

socketio.listen(server).on("connection", function (socket) {
    
    socket.on("message", function (msg) {
        console.log("收到消息:", msg);
        socket.broadcast.emit("message", msg);
    });

    socket.on("reg_check_username_server", function (uzn) {
        console.log("收到需检查的用户名:",uzn);
        var is_checked = -1;
        c.query('SELECT COUNT(username)=0 FROM user WHERE username = :username',uzn) //检查数据库，在没有重名的时候输出1
         .on('result', function(res) {
           res.on('row', function(row) {
            console.log('查到的结果是:' + inspect(row));
             for (x in row){
                is_checked = row[x];
                if (row[x] == 1) {
                  console.log('用户名没有重复'+uzn.username);
                }else {
                  console.log('用户名重复了:'+uzn.username);
                };
                socket.emit("reg_check_username_client", is_checked); //这里加入数据库检测，重名发送0，未重名发送1
              };
           })
           .on('error', function(err) {
             console.log('查找重名发生异常错误:' + inspect(err));
           })
           .on('end', function(info) {
             console.log('查找重名完毕');
           });
         })
         .on('end', function() {
           console.log('所有结果输出完毕');
         });
    });

    socket.on("reg_submit_server", function (data) {
        console.log("收到提交的新用户注册表单对象:\n",data);
        console.log("返回:",data);
        socket.emit("reg_submit_client",data); //如果成功加入数据，返回对象.
    });
});
