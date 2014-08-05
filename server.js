var fs = require('fs')
    , http = require('http')

var inspect = require('util').inspect;
var socketio = require('socket.io');
var Client = require('mariasql');
var c = new Client();

    

var server = http.createServer(function(req, res) {
    res.writeHead(200, { 'Content-type': 'text/html'});
    res.end('please view this page through your app\n');
}).listen(2333, function() {
    console.log('处理register/login/message/main 监听: http://157.7.138.169:2333');    
});

    c.connect({
      host: 'localhost',
      user: 'root',
      password: 'coco0929',
      db: 'moe',
      charset: 'utf8'
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

socketio.listen(server).on('connection', function (socket) {
    
    socket.on('message', function (msg) {
        console.log('收到消息:', msg);
        socket.broadcast.emit('message', msg);
    });

    socket.on('reg_check_username_server', function (uzn) {
        console.log('收到需检查的用户名:',uzn);
        var is_checked = -1;
        c.query('SELECT COUNT(username)=0 FROM user WHERE username = :username',uzn) //检查数据库,在没有重名的时候输出1
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
                socket.emit('reg_check_username_client', is_checked); //重名向客户端发送0,未重名发送1
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
    


    socket.on('reg_submit_server', function (data) {
        console.log('收到提交的新用户注册表单对象:\n',data);

        c.query('INSERT INTO user SET id = ?, username = ?, password = ?, email = ?, qq = ?, nickname = ?, sq = ?, isq = ?',[data.id,data.username,data.password,data.email,data.qq,data.nickname,data.sq,data.isq])
         .on('result', function(res) {
           res.on('row', function(row) {
            console.log('结果是:' + inspect(row));
           })
           .on('error', function(err) {
             console.log('发生异常错误:' + inspect(err));
           })
           .on('end', function(info) {
             console.log('添加完毕');
           });
         })
         .on('end', function() {
           console.log('所有结果输出完毕');
         });
        console.log('返回:',data);
        socket.emit('reg_submit_client',data); //如果成功插入数据,返回对象.
    });    

    socket.on('login_server', function (logindata) {
        console.log('收到登录data:',logindata);
        var is_right = -1;
        c.query('SELECT COUNT(username)=1 FROM user WHERE id = :id AND username = :username',logindata)
         .on('result', function(res) {
           res.on('row', function(row) {
            console.log('查到的结果是:' + inspect(row));
            for (x in row){
                is_right = row[x];
                if (row[x] == 1) { //若id和用户名正确,进行第二遍查询,查询出nickname
                  console.log('允许登录'+logindata.username);
                  c.query('SELECT * FROM user WHERE id = :id AND username = :username',logindata)
                     .on('result', function(res) {
                       res.on('row', function(row) {
                        row.flag = is_right;
                        console.log('输出row'+row);
                        socket.emit('login_client',row); //允许登录发送1/不允许登录发送0/错误发送-1
                       })
                       .on('error', function(err) {
                         console.log('结果输出错误: ' + inspect(err));
                       })
                       .on('end', function(info) {
                         console.log('结果输出成功');
                       });
                     })
                     .on('end', function() {
                       console.log('所有结果输出完毕');
                     });
                }else {
                  console.log('不允许登录,没有此用户或密码错误:'+logindata.username);
                  row.flag = 0;
                  socket.emit('login_client',row); //允许登录发送1/不允许登录发送0/错误发送-1
                };
              };
           })
           .on('error', function(err) {
             console.log('登录程序发生异常错误:' + inspect(err));
           })
           .on('end', function(info) {
             console.log('登录处理完毕');
           });
         })
         .on('end', function() {
           console.log('所有结果输出完毕');
         });
    });

        
});
