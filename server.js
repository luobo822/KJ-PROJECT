var fs = require('fs')
    , http = require('http')

var inspect = require('util').inspect;
var socketio = require('socket.io');
var Client = require('mariasql');

var c = new Client();

var server = http.createServer(function(req, res) {
    res.writeHead(200, { 'Content-type': 'text/html'});
    res.end('running');
}).listen(2333, function() {
    console.log('监听: http://157.7.138.169:2333');    
    console.log('处理register/login/message/main');
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
    
//reg

    socket.on('reg_check_username_server', function (uzndata) {
        console.log('收到需检查的用户名:',uzndata);
        var is_checked = -1;
        c.query('SELECT COUNT(username)=0 FROM user WHERE username = :username',uzndata) //检查数据库,在没有重名的时候输出1
         .on('result', function(res) {
           res.on('row', function(row) {
            console.log('查到的结果是:' + inspect(row));
             for (x in row){
                is_checked = row[x];
                if (row[x] == 1) {
                  console.log('用户名没有重复'+uzndata.username);
                }else {
                  console.log('用户名重复了:'+uzndata.username);
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
    


    socket.on('reg_submit_server', function (regdata) {
        console.log('收到提交的新用户注册表单对象:\n',regdata);
        c.query('INSERT INTO user SET id = ?, username = ?, password = ?, email = ?, qq = ?, nickname = ?, sq = ?, isq = ?',[regdata.id,regdata.username,regdata.password,regdata.email,regdata.qq,regdata.nickname,regdata.sq,regdata.isq])
         .on('result', function(res) {
           res.on('row', function(row) {
            console.log('注册的结果是:' + inspect(row));
            //alter_add_nicakname
            
             
            //alter_add_nickname 结束           
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
         console.log('alter_relation:开始添加新用户字段:'+regdata.nickname);
        c.query('ALTER TABLE relation ADD '+regdata.nickname+' text')
             .on('result', function(res) {
               res.on('row', function(row) {
                console.log('alter_relation:加入新用户字段的结果是:' + inspect(row));
               })
               .on('error', function(err) {
                 console.log('alter_relation:发生异常错误:' + inspect(err));
               })
               .on('end', function(info) {
                 console.log('alter_relation:新用户字段添加完毕');
               });
             })
          .on('end', function() {
             console.log('alter_relation:所有结果输出完毕');
           });
        console.log('返回:',regdata);
        socket.emit('reg_submit_client',regdata); //如果成功插入数据,返回对象.
    });    

//login

    socket.on('login_server', function (logindata) {
        console.log('收到登录data:',logindata);
        var is_right = -1;
        c.query('SELECT COUNT(username)=1 FROM user WHERE id = :id AND username = :username',logindata)
         .on('result', function(res) {
           res.on('row', function(row) {
            console.log('查到的结果是:' + inspect(row));
            for (x in row){
                is_right = row[x];
                if (row[x] == 1) { //若id和用户名正确,进行第二遍查询,查出nickname
                  console.log('允许登录'+logindata.username);
                  c.query('SELECT * FROM user WHERE id = :id AND username = :username',logindata)
                     .on('result', function(res) {
                       res.on('row', function(row) {
                        row.flag = is_right;
                        console.log('输出row'+inspect(row));
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

//main

    socket.on('main_message_server', function (msgdata) {
        console.log('main_message_server:收到消息:', msgdata);
        socket.broadcast.emit('message', msgdata);
    });
    
    socket.on('main_csv_submit_server', function (csvdata_nickname) { //csvdata是一个数组,格式为[csvdata[],nickname]
        console.log('main_csv_submit_server:收到提交的csv数组:\n',csvdata_nickname);
        var is_success = -1;
        c.query('SELECT COUNT(i2)=0 FROM itemdata WHERE i2 = ?',[csvdata_nickname[0][1]])
         .on('result', function(res) {
           res.on('row', function(row) { 
            for (var temp in row){
                if (row[temp] == 1) { //这里判断itemdata表里是否已经有了这个item的数据,这是没有数据
                  console.log('main_csv_submit_server:item没有重复:'+csvdata_nickname[0][1]);
                  insert_itemdata(csvdata_nickname[0]); //传csvdata[]
                  socket.emit('main_csv_submit_client', csvdata_nickname[0][1]);
                }else{
                    console.log('main_csv_submit_server:item重复了:'+csvdata_nickname[0][1]);
                    socket.emit('main_csv_submit_client',0);
                    //check_exist/update_relation
                    c.query('SELECT COUNT('+csvdata_nickname[1]+')=0 FROM relation WHERE i2 = ?',[csvdata_nickname[0][1]])
                             .on('result', function(res) {
                               res.on('row', function(row) {
                                console.log('check_exist:' + inspect(row));
                                console.log(temp);
                                for (var q in row) {
                                  if (row[q] == 1) {
                                    console.log('可以UPDATE relation');
                                    update_relation(csvdata_nickname[1],csvdata_nickname[0][1],csvdata_nickname[1]+':1'+','+'finish:0'); //变成对象的形式nickname:1//update_relation_nickname(nickname,itemid,buyobjectstring)
                                  }else{
                                    console.log('已有重复数据');
                                  };
                                };
                               })
                               .on('error', function(err) {
                                 console.log('check_exist:发生异常错误:' + inspect(err));
                               })
                               .on('end', function(info) {
                                 console.log('check_exist完毕');
                               });
                             })
                             .on('end', function() {
                               console.log('check_exist所有结果输出完毕');
                             });
                    //check_exist结束


                };
            };

           })
           .on('error', function(err) {
             console.log('main_csv_submit_server:发生异常错误:' + inspect(err));
             socket.emit('main_csv_submit_client',-1);
           })
           .on('end', function(info) {
             console.log('main_csv_submit_server:检查完毕');
           });
         })
         .on('end', function() {
           console.log('main_csv_submit_server:所有结果输出完毕');
         });




    });

    socket.on('main_mission_server', function (nickname) {
      console.log('main_mission_server:收到任务刷新请求,请求的发送用户是', nickname);
      c.query('SELECT i2,'+nickname+' FROM relation')
       .on('result', function(res) {
         res.on('row', function(row) {
          console.log('main_mission_server:查询成功'+inspect(row));
          if (row[nickname]) {
            socket.emit('main_mission_client',row);
          };
         })
         .on('error', function(err) {
           console.log('main_mission_server:发生异常错误:' + inspect(err));
           socket.emit('main_mission_client',-1);
         })
         .on('end', function(info) {
           console.log('main_mission_server:推送完毕');
         })
       })
       .on('end', function() {
         console.log('main_mission_server:结果输出完毕');
       });
      
    }); //socket.on('main_mission_server') ending 

//函数要异步太电波了!


function insert_itemdata(csvdata){
c.query('INSERT INTO itemdata SET i1 = ?, i2 = ?, i3 = ?, i4 = ?, i5 = ?, i6 = ?, i7 = ?, i8 = ?, i9 = ?, i10 = ?, i11 = ?, i12 = ?,'+
        'i13 = ?, i14 = ?, i15 = ?, i16 = ?, i17 = ?, i18 = ?, i19 = ?, i20 = ?, i21 = ?, i22 = ?, i23 = ?, i24 = ?, i25 = ?, i26 = ?, i27 =?',
         csvdata)
         .on('result', function(res) {
           res.on('row2', function(row2) {
            console.log('insert_itemdata:插入成功');
            socket.emit('main_csv_submit_client',csvdata[1]); //插入成功,返回item id
           })
           .on('error', function(err) {
             console.log('insert_itemdata:发生异常错误:' + inspect(err));
             socket.emit('main_csv_submit_client',-1); //发生错误,返回-1.
           })
           .on('end', function(info) {
             console.log('insert_itemdata:完毕');
             // socket.emit('main_csv_submit_client',csvdata[1]); //添加成功,返回item id
           })
         })
         .on('end', function() {
           console.log('insert_itemdata:item插入结果输出完毕');
         });
};


function update_relation(nickname,itemid,buyobjectstring){ //nickname昵称对应宝物的所有者,itemid宝物唯一识别码,buyobjectstring是字符串形式的对象{usertoby:buynumber}
c.query('INSERT INTO relation SET '+nickname+'= ?, '+'i2 = ?',[buyobjectstring,itemid])
         .on('result', function(res) {
           res.on('row', function(row) {
            console.log('update_relation:关系表更新的结果是:' + inspect(row));
            socket.emit('main_csv_submit_client',itemid); //添加失败,返回0
           })
           .on('error', function(err) {
             console.log('update_relation:发生异常错误:' + inspect(err));
           })
           .on('end', function(info) {
             console.log('update_relation:添加完毕');
           });
         })
         .on('end', function() {
           console.log('update_relation:所有结果输出完毕');
          });

};



function check_exist(tablename,columnname,condition){
c.query('SELECT COUNT('+columnname+')=0 FROM '+tablename+' '+condition)
         .on('result', function(res) {
           res.on('row', function(row) {
            console.log('check_exist:' + inspect(row));
            for (x in row) {
              return row[x]; //此字段有符合condition的值存在或有值存在,返回0;否则返回1;
            };
           })
           .on('error', function(err) {
             console.log('check_exist:发生异常错误:' + inspect(err));
           })
           .on('end', function(info) {
             console.log('check_exist完毕');
           });
         })
         .on('end', function() {
           console.log('check_exist所有结果输出完毕');
         });
};











//     c.query('SELECT COUNT('+nickname+')=0 FROM relation') 
//          .on('result', function(res) { 
//            res.on('row', function(row) {
//             console.log('alter_relation:这个昵称已存在,直接UPDATE数量/代购用户');

            

//            })
//            .on('error', function(err) {
//               console.log('update_relation:出现意外错误')
//               return -1;
//            })
//            .on('end', function(info) {
//              console.log('alter_relation:查找重名完毕');
//            });
//          })
//          .on('end', function() {
//            console.log('alter_relation:所有结果输出完毕');
//          });
// };




//加入用户字段
// function alter_relation_add_nickname(nickname){
// c.query('ALTER TABLE relation ADD '+nickname+' text')
//  .on('result', function(res) {
//    res.on('row', function(row) {
//     console.log('alter_relation:加入新用户字段的结果是:' + inspect(row));
//     alter_relation(nickname,itemid,buyobjectstring);
//    })
//    .on('error', function(err) {
//      console.log('alter_relation:发生异常错误:' + inspect(err));
//    })
//    .on('end', function(info) {
//      console.log('alter_relation:添加完毕');
//    });
//  })
//  .on('end', function() {
//    console.log('alter_relation:所有结果输出完毕');
//  });

// };


// function update_relation(number){
//     c.query('SELECT COUNT('+nickname+')=0 FROM relation') 
//          .on('result', function(res) {
//            res.on('row', function(row) {
//             console.log('查到的结果是:' + inspect(row));
//             return 1;
//            })
//            .on('error', function(err) {
//              if (err['code'] == 1054) {
//                 return 0;
//              }else{
//                 return -1;
//              };
//            })
//            .on('end', function(info) {
//              console.log('查找重名完毕');
//            });
//          })
//          .on('end', function() {
//            console.log('所有结果输出完毕');
//          });

// };
        

//SQL模板

// c.query('')
//          .on('result', function(res) {
//            res.on('row2', function(row2) {
//             console.log('成功');
//            })
//            .on('error', function(err) {
//              console.log('发生异常错误:' + inspect(err));
//            })
//            .on('end', function(info) {
//              console.log('完毕');
//            })
//          })
//          .on('end', function() {
//            console.log('结果输出完毕');
//          });















});