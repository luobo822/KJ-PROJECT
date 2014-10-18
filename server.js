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
    console.log('处理register/login/message/main/request');
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

//requset

    socket.on('request_read_server', function () {
       console.log('requset_read_server:收到要求数据库推送请求');
       c.query('SELECT * FROM request')
       .on('result', function(res) {
         res.on('row', function(row) {
          console.log(inspect(row));
          socket.emit('request_read_client',row);
         })
         .on('error', function(err) {
           console.log('requset_read_server:发生异常错误:' + inspect(err));
         })
         .on('end', function(info) {
           console.log('requset_read_server:完毕');
         })
       })
       .on('end', function() {
         console.log('requset_read_server:结果输出完毕');
     });

    });

    socket.on('request_write_server', function (text) {
       console.log('requset_write_server:收到要求数据库写入请求');
       var d = new Date();
       console.log(d.toString());
       c.query('INSERT INTO request SET time = ?,text = ?',[d.toString(),text])
       .on('result', function(res) {
         res.on('row', function(row) {
          console.log(inspect(row));
          console.log("apasjkdkajsdk");
          socket.emit('request_read_client',row);
         })
         .on('error', function(err) {
           console.log('requset_write_server:发生异常错误:' + inspect(err));
         })
         .on('end', function(info) {
           console.log('requset_write_server:完毕');
         })
       })
       .on('end', function() {
         console.log('requset_write_server:结果输出完毕');
     });

    });


//reg

    socket.on('reg_check_username_server', function (uzndata) {
        console.log('reg_check_username_server:收到需检查的用户名:',uzndata);
        var is_checked = -1;
        c.query('SELECT COUNT(username)=0 FROM user WHERE username = :username',uzndata) //检查数据库,在没有重名的时候输出1
         .on('result', function(res) {
           res.on('row', function(row) {
            console.log('reg_check_username_server:查到的结果是:' + inspect(row));
             for (x in row){
                is_checked = row[x];
                if (row[x] == 1) {
                  console.log('reg_check_username_server:用户名没有重复'+uzndata.username);
                }else {
                  console.log('reg_check_username_server:用户名重复了:'+uzndata.username);
                };
                socket.emit('reg_check_username_client', is_checked); //重名向客户端发送0,未重名发送1
              };
           })
           .on('error', function(err) {
             console.log('reg_check_username_server:查找重名发生异常错误:' + inspect(err));
           })
           .on('end', function(info) {
             console.log('reg_check_username_server:查找重名完毕');
           });
         })
         .on('end', function() {
           console.log('reg_check_username_server:所有结果输出完毕');
         });
    });

    socket.on('reg_check_nickname_server', function (nickname) {
        console.log('reg_check_nickname_server:收到需检查的昵称:',nickname);
        var is_checked = -1;
        c.query('SELECT COUNT(nickname)=0 FROM user WHERE nickname = ?',[nickname]) //检查数据库,在没有重名的时候输出1
         .on('result', function(res) {
           res.on('row', function(row) {
            console.log('reg_check_nickname_server:查到的结果是:' + inspect(row));
             for (x in row){
                is_checked = row[x];
                if (row[x] == 1) {
                  console.log('reg_check_nickname_server:昵称没有重复'+nickname);
                }else {
                  console.log('reg_check_nickname_server:昵称重复了:'+nickname);
                };
                socket.emit('reg_check_nickname_client',is_checked); //重名向客户端发送0,未重名发送1
              };
           })
           .on('error', function(err) {
             console.log('reg_check_nickname_server:查找重名发生异常错误:' + inspect(err));
           })
           .on('end', function(info) {
             console.log('reg_check_nickname_server:查找重名完毕');
           });
         })
         .on('end', function() {
           console.log('reg_check_nickname_server:所有结果输出完毕');
         });
    });

    socket.on('reg_submit_server', function (regdata) {

        console.log('收到提交的新用户注册表单对象:\n',regdata);

        c.query('INSERT INTO user SET id = ?, username = ?, password = ?, email = ?, qq = ?, nickname = ?, sq = ?, isq = ? ,power = ?',[regdata.id,regdata.username,regdata.password,regdata.email,regdata.qq,regdata.nickname,regdata.sq,regdata.isq,0])
         .on('result', function(res) {
           res.on('row', function(row) {
            console.log('注册的结果是:' + inspect(row));
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

        console.log('alter_group:开始添加新用户字段:'+regdata.nickname);

        c.query('ALTER TABLE groups ADD \`'+regdata.nickname+'\` text')
             .on('result', function(res) {
               res.on('row', function(row) {
                console.log('alter_group:加入新用户字段的结果是:' + inspect(row));
               })
               .on('error', function(err) {
                 console.log('alter_group:发生异常错误:' + inspect(err));
               })
               .on('end', function(info) {
                 console.log('alter_group:新用户字段添加完毕');
               });
             })
          .on('end', function() {
             console.log('alter_group:所有结果输出完毕');
        });

        c.query('ALTER TABLE relation ADD \`'+regdata.nickname+'\` text')
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
                if (row[x] == 1) { //若id和用户名正确,进行第二遍查询,查出这个用户的所有数据
                  console.log('允许登录'+logindata.username);
                  c.query('SELECT * FROM user WHERE id = :id AND username = :username',logindata)
                     .on('result', function(res) {
                       res.on('row', function(row) {
                        row.flag = is_right;
                        console.log('输出row'+inspect(row));
                        socket.emit('login_client',row); //允许登录flag=1/不允许登录flag=0/发生错误flag=-1
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
                  socket.emit('login_client',row); //允许登录flag=1/不允许登录flag=0/发生错误flag=-1
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
        // var name_whobuy = '/\"'+csvdata_nickname[1]+'/\"';
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
                };
                update_relation(csvdata_nickname[1],csvdata_nickname[0][1],'{\"bought\":0,\"target\":1,\"finish\":0,\"whobuy\":\"'+csvdata_nickname[1]+'\"}'); //变成对象的形式nickname:1//update_relation_nickname(nickname,itemid,buyobjectstring)
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


    socket.on('main_mission_list_server', function (nickname) {
      console.log('main_mission_list_server:收到任务刷新请求,请求的发送用户是'+nickname);
      // nickname = ':"'+nickname+'"';
      c.query('SELECT * FROM relation WHERE '+nickname+' is not null')
       .on('result', function(res) {
         res.on('row', function(row) {
          select_itemdata(row);
         })
         .on('error', function(err) {
           console.log('main_mission_list_server:发生异常错误:' + inspect(err));
         })
         .on('end', function(info) {
           console.log('main_mission_list_server:推送完毕');
         })
       })
       .on('end', function() {
         console.log('main_mission_list_server:结果输出完毕');
       });

    }); //socket.on('main_mission_list_server') ending

    socket.on('main_edit_data_server', function (editdata,editprice,nickname,itemid){
     console.log('main_edit_data_server:收到关系表编辑请求,请求的发送用户是'+nickname);
      c.query('UPDATE relation SET '+nickname+'= ? WHERE i2 = ?',[editdata,itemid])
       .on('result', function(res) {
         res.on('row', function(row) {
          console.log('main_edit_data_server:关系表编辑的结果是'+inspect(row));

         })
         .on('error', function(err) {
           console.log('main_edit_data_server:关系表编辑过程中发生异常错误:' + inspect(err));
         })
         .on('end', function(info) {
           console.log('main_edit_data_server:关系表编辑结果输出完毕');
         })
       })
       .on('end', function() {
         console.log('main_edit_data_server:关系表和价格编辑结果输出完毕');
       });
       console.log('main_edit_data_server:收到价格编辑请求,请求的发送用户是'+nickname);
      c.query('UPDATE itemdata SET i27 = ? WHERE i2 = ?',[editprice,itemid])
       .on('result', function(res) {
         res.on('row', function(row) {
          console.log('编辑价格完毕'+editprice);
          // socket.emit('main_edit_data_client',1);
         })
         .on('error', function(err) {
           console.log('main_edit_data_server:编辑价格时发生异常错误:' + inspect(err));
           // socket.emit('main_edit_data_client',-1);
         })
         .on('end', function(info) {
           console.log('main_edit_data_server:价格编辑完毕');
         })
       })
       .on('end', function() {
         console.log('main_edit_data_server:价格编辑结果输出完毕');
       });
    });

    socket.on('main_calc_server', function(nickname,day){

      console.log('main_calc_server:收到结算请求,请求的发送用户是'+nickname);

      c.query('SELECT * FROM relation WHERE '+nickname+' is not null')
       .on('result', function(res) {
         res.on('row', function(row) {
          console.log('main_calc_server:'+inspect(row));
          select_itemdata_for_calc(row);
         })
         .on('error', function(err) {
           console.log('main_calc_server:发生异常错误:' + inspect(err));
         })
         .on('end', function(info) {
           console.log('main_calc_server:推送完毕');
         })
       })
       .on('end', function() {
         console.log('main_calc_server:结果输出完毕');
       });

    }); //socket.on('main_calc_server') ending

    socket.on('main_select_group_server', function(nickname){
      console.log('main_select_group_server:收到队伍推送请求,请求的发送用户是'+nickname);
      c.query('SELECT * FROM groups')
       .on('result', function(res) {
         res.on('row', function(row) {
          delete row['group_password'];
          socket.emit('main_select_group_client',row);
          console.log('main_select_group_server:向客户端推送成功'+inspect(row));
         })
         .on('error', function(err) {
           console.log('main_select_group_server:发生异常错误:' + inspect(err));
         })
         .on('end', function(info) {
           console.log('main_select_group_server:推送完毕');
         })
       })
       .on('end', function() {
         console.log('main_select_group_server:结果输出完毕');
       });

    }); //socket.on('main_select_group_server') ending

    socket.on('main_manage_group_add_server', function(new_group_data,nickname){
      console.log('main_manage_group_add_server:收到新队伍创建请求,请求的发送用户是'+nickname);
      c.query('SELECT COUNT(group_name)=0 FROM groups WHERE group_name = ?',[new_group_data['group_name']])
         .on('result', function(res) {
            res.on('row', function(row) {
              for (var temp in row){
                  if (row[temp] == 1) {
                    console.log('main_manage_group_add_server:队伍名字没有重复:'+new_group_data['group_name']);
                    write_new_group(new_group_data,nickname);
                  }else{
                      console.log('main_manage_group_add_server:队伍名字重复了:'+new_group_data['group_name']);
                      socket.emit('alert_client',5,0);
                  };
                };
            })
         .on('error', function(err) {
           console.log('main_manage_group_add_server:发生异常错误:' + inspect(err));
         })
         .on('end', function(info) {
           console.log('main_manage_group_add_server:推送完毕');
         })
       })
       .on('end', function() {
         console.log('main_manage_group_add_server:结果输出完毕');
       });

    }); //socket.on('main_manage_group_add_server') ending

    socket.on('main_op_group_server', function(nickname,op_type,now_group,group_password,group_introduction,new_group_name){
          switch (op_type){
            case 1:
              console.log("main_op_group_server_join:收到加入队伍请求:"+nickname+"将加入"+now_group);
              c.query('SELECT group_password FROM groups WHERE group_name = ?',[now_group])
               .on('result', function(res) {
                 res.on('row', function(row) {
                  if (row['group_password'] == group_password) {
                    c.query('UPDATE groups SET \`'+nickname+'\` = ? WHERE group_name = ?',['member',now_group])
                     .on('result', function(res) {
                       res.on('row', function(row) {
                       })
                       .on('error', function(err) {
                         console.log('main_op_group_server_join_update:发生异常错误:' + inspect(err));
                       })
                       .on('end', function(info) {
                         console.log('main_op_group_server_join_update:推送完毕');
                       })
                     })
                     .on('end', function() {
                     	
	                        c.query('ALTER TABLE \`'+now_group+'_circle\` ADD '+nickname+' text')
			              .on('result', function(res) {
			                 res.on('row', function(row) {
			                 })
			                 .on('error', function(err) {
			                  socket.emit('alert_client',1,0);
			                  console.log('join_group_alter_circle:发生异常错误:' + inspect(err));
			                 })
			                 .on('end', function(info) {
//		                       socket.emit('alert_client',1,1);
			                   console.log('join_group_alter_circle:完毕');
			                 })
			               })
			               .on('end', function() {
			                 console.log('join_group_alter_circle:结果输出完毕');
			               });
			               
			               c.query('ALTER TABLE \`'+now_group+'_data\` ADD '+nickname+' text')
			              .on('result', function(res) {
			                 res.on('row', function(row) {
			                 })
			                 .on('error', function(err) {
			                  socket.emit('alert_client',1,0);
			                  console.log('join_group_alter_data:发生异常错误:' + inspect(err));
			                 })
			                 .on('end', function(info) {
		                       socket.emit('alert_client',1,1);
			                   console.log('join_group_alter_data:完毕');
			                 })
			               })
			               .on('end', function() {
			                 console.log('join_group_alter_data:结果输出完毕');
			               });
			               
			               
                        console.log('main_op_group_server_join_update:结果输出完毕');
                     });
                  }else{
                    socket.emit("alert_client",1,0);
                  };
                  console.log('main_op_group_server_join:向客户端推送成功'+inspect(row));
                 })
                 .on('error', function(err) {
                   console.log('main_op_group_server_join:发生异常错误:' + inspect(err));
                 })
                 .on('end', function(info) {
                   console.log('main_op_group_server_join:推送完毕');
                 })
               })
               .on('end', function() {
                 console.log('main_op_group_server_join:结果输出完毕');
               });
            break;

            case 2:
              console.log("main_op_group_server_exit:收到退出队伍请求:"+nickname+"将退出"+now_group);
              c.query('UPDATE groups SET \`'+nickname+'\` = ? WHERE group_name = ?',[null,now_group])
               .on('result', function(res) {
                 res.on('row', function(row) {
                  console.log('main_op_group_server_exit:向客户端推送成功'+inspect(row));
                 })
                 .on('error', function(err) {
                    socket.emit('alert_client',2,0);
                    console.log('main_op_group_server_exit:发生异常错误:' + inspect(err));
                 })
                 .on('end', function(info) {
                     c.query('ALTER TABLE \`'+now_group+'_circle\` DROP \`'+nickname+'\`')
					    .on('result', function(res) {
					      res.on('row', function(row) {
					       console.log('main_op_group_server_exit_drop:成功');
					      })
					      .on('error', function(err) {
						  	socket.emit('alert_client',2,0);
					        console.log('main_op_group_server_exit_drop:发生异常错误:' + inspect(err));
					      })
					      .on('end', function(info) {
//			                socket.emit('alert_client',2,1);
					        console.log('main_op_group_server_exit_drop:完毕');
					      })
					    })
					    .on('end', function() {
					      console.log('main_op_group_server_exit_drop:结果输出完毕');
					    });
					    
					    c.query('ALTER TABLE \`'+now_group+'_data\` DROP \`'+nickname+'\`')
					    .on('result', function(res) {
					      res.on('row', function(row) {
					       console.log('main_op_group_server_exit_drop:成功');
					      })
					      .on('error', function(err) {
						  	socket.emit('alert_client',2,0);
					        console.log('main_op_group_server_exit_drop:发生异常错误:' + inspect(err));
					      })
					      .on('end', function(info) {
			                socket.emit('alert_client',2,1);
					        console.log('main_op_group_server_exit_drop:完毕');
					      })
					    })
					    .on('end', function() {
					      console.log('main_op_group_server_exit_drop:结果输出完毕');
					    });
					    
                   console.log('main_op_group_server_exit:推送完毕');
                 })
               })
               .on('end', function() {
                  console.log('main_op_group_server_exit:结果输出完毕');
               });
            break;

            case 3:
              console.log("main_op_group_server_delete:收到解散队伍请求:"+nickname+"将解散"+now_group);
             c.query('SELECT \`'+nickname+'\` FROM groups WHERE group_name = ?',[now_group])
               .on('result', function(res) {
                 res.on('row', function(row) {
                    if (row[nickname] == 'leader') {
                      console.log("此人是leader,允许解散");
                    };
                    // console.log('main_op_group_server_delete_select:向客户端推送成功'+inspect(row));
                    c.query('DELETE FROM groups WHERE group_name = ?',[now_group])
                     .on('result', function(res) {
                       res.on('row', function(row) {
                        // console.log('main_op_group_server_delete:向客户端推送成功'+inspect(row));
                       })
                       .on('error', function(err) {
                        console.log("DELETE行出错");
                         socket.emit('alert_client',3,0);
                         console.log('main_op_group_server_delete:发生异常错误:' + inspect(err));
                       })
                       .on('end', function(info) {
//DROP表
                        c.query('DROP TABLE IF EXISTS \`'+now_group+'_circle\`')
                         .on('result', function(res) {
                           res.on('row', function(row) {
                            console.log('main_op_group_server_delete_drop:已删除表'+inspect(row));
                           })
                           .on('error', function(err) {
                            console.log("DROP出错")
                             socket.emit('alert_client',3,0);
                             console.log('main_op_group_server_delete_drop:删除表出错:' + inspect(err));
                           })
                           .on('end', function(info) {
                              socket.emit('alert_client',3,1);
                              console.log('main_op_group_server_delete_drop:删除表结束');
                           })
                         })
                         .on('end', function() {
                           console.log('main_op_group_server_delete_drop:结果输出完毕');
                         });
                         
                         c.query('DROP TABLE IF EXISTS \`'+now_group+'_data\`')
                         .on('result', function(res) {
                           res.on('row', function(row) {
                            console.log('main_op_group_server_delete_drop:已删除表'+inspect(row));
                           })
                           .on('error', function(err) {
                            console.log("DROP出错")
                             socket.emit('alert_client',3,0);
                             console.log('main_op_group_server_delete_drop:删除表出错:' + inspect(err));
                           })
                           .on('end', function(info) {
                              socket.emit('alert_client',3,1);
                              console.log('main_op_group_server_delete_drop:删除表结束');
                           })
                         })
                         .on('end', function() {
                           console.log('main_op_group_server_delete_drop:结果输出完毕');
                         });
//DROP表结束
                       })
                     })//result ending
                     .on('end', function() {
                       console.log('main_op_group_server_delete:结果输出完毕');
                     });

                 })//result ending
                 .on('error', function(err) {
                   socket.emit('alert_client',3,0);
                   console.log('main_op_group_server_delete_select:发生异常错误:' + inspect(err));
                 })
                 .on('end', function(info) {
                   console.log('main_op_group_server_delete_select:推送完毕');
                 })
                })
               .on('end', function() {
                 console.log('main_op_group_server_delete_select:结果输出完毕');
               });
            break;

            case 4:
              console.log("main_op_group_server_rewrite:收到队伍信息覆写请求");
              c.query('SELECT \`'+nickname+'\` FROM groups WHERE group_name = ?',[now_group])
                .on('result', function(res) {
                  res.on('row', function(row) {
                    // socket.emit('alert_client',4,1);
                    if (row[nickname] == 'leader') {
                    console.log("此人是leader,允许覆写");
                    c.query('UPDATE groups SET group_name = ?,group_password = ?,group_introduction = ? WHERE group_name = ?',[new_group_name,group_password,group_introduction,now_group])
                     .on('result', function(res) {
                       res.on('row', function(row) {
                       })
                       .on('error', function(err) {
                        socket.emit('alert_client',4,0);
                        console.log('main_op_group_server_update:发生异常错误:' + inspect(err));
                       })
                       .on('end', function(info) {
                        console.log('main_op_group_server_update:推送完毕');

                        if (new_group_name != now_group) {
//重命名表
                          c.query('RENAME TABLE \`'+now_group+'_circle\` TO \`'+new_group_name+'_circle\`')
                           .on('result', function(res) {
                             res.on('row', function(row) {
                             })
                             .on('error', function(err) {
                              socket.emit('alert_client',4,0);
                              console.log('main_op_group_server_rename:发生异常错误:' + inspect(err));
                             })
                             .on('end', function(info) {
                              socket.emit('alert_client',4,1);
                              console.log('main_op_group_server_rename:推送完毕');
                             })
                           })
                           .on('end', function() {
                             console.log('main_op_group_server_rename:结果输出完毕');
                           });
                           
                           c.query('RENAME TABLE \`'+now_group+'_data\` TO \`'+new_group_name+'_data\`')
                           .on('result', function(res) {
                             res.on('row', function(row) {
                             })
                             .on('error', function(err) {
                              socket.emit('alert_client',4,0);
                              console.log('main_op_group_server_rename:发生异常错误:' + inspect(err));
                             })
                             .on('end', function(info) {
                              socket.emit('alert_client',4,1);
                              console.log('main_op_group_server_rename:推送完毕');
                             })
                           })
                           .on('end', function() {
                             console.log('main_op_group_server_rename:结果输出完毕');
                           });
                           
                        };//  if ending
                       })// previous end ending
                     })// previous result ending
                     .on('end', function() {
                       console.log('main_op_group_server_update:结果输出完毕');
                     });
                  };

                  })
                  .on('error', function(err) {
                    socket.emit('alert_client',4,0);
                    console.log('main_op_group_server_rewrite_select:发生异常错误:' + inspect(err));
                  })
                  .on('end', function(info) {
                    console.log('main_op_group_server_rewrite_select:完毕');
                  })
                })
                .on('end', function() {
                  console.log('main_op_group_server_rewrite_select:结果输出完毕');
                });
            break;
          };//  switch ending
        }); //	socket.on('main_op_group_server') ending
        
        socket.on('main_add_item_server',function(item_name,item_price,circle_name,item_copy_number,nickname,which_group,reser){ // (name text ,price text,circle_id text
		   c.query('SELECT COUNT(i2)  FROM \`'+which_group+'_circle\` WHERE i2 = ?',[item_number])
	        .on('result', function(res) {
	          res.on('row', function(row) {
	           	for (x in row){
                	if (row[x] >= 1) {
              		 c.query('INSERT INTO \`'+which_group+'_data\` SET circle_id = ?,name = ?, price = ?,\`'+nickname+'\` = ?',[item_number,item_name,item_price,'{"bought":0,"target":'+item_copy_number+',"finish":0,"whobuy":"'+reser+'"}'])
					    .on('result', function(res) {//STOP
					      res.on('row', function(row) {
					       console.log('main_add_item_server_insert:成功');
					      })
					      .on('error', function(err) {
					        console.log('main_add_item_server_insert:发生异常错误:' + inspect(err));
					      })
					      .on('end', function(info) {
					      	socket.emit('alert_client',6,1);
					        console.log('main_add_item_server_insert:完毕');
					      })
					    })
					    .on('end', function() {
					      console.log('main_add_item_server_insert:结果输出完毕');
					    });
                	}else{
                		socket.emit('alert_client',6,0);
                	};
              	};//	for ending
	          })
	          .on('error', function(err) {
	            console.log('main_add_item_server:发生异常错误:' + inspect(err));
	          })
	          .on('end', function(info) {
	            console.log('main_add_item_server:完毕');
	          })
	        })
	        .on('end', function() {
	          console.log('main_add_item_server:结果输出完毕');
	        });//	query ending
        });//	socket.on('main_add_item_server') ending
        
        socket.on('main_add_circle_server',function(circle_date,circle_area,circle_number,circle_block_name,circle_space_number,circle_name,circle_rank,circle_author,nickname,which_group){
		   c.query('SELECT COUNT(i2)=0  FROM \`'+which_group+'_circle\` WHERE i2 = ?',[circle_number])
	        .on('result', function(res) {
	          res.on('row', function(row) {
	           	for (x in row){
                	if (row[x] == 1) {
              		 c.query('INSERT INTO \`'+which_group+'_circle\` SET i1 = ?, i2 = ? , i5 = ?,i6 = ?,i7 = ?,i8= ?,i9 = ?, i11 = ?, i13 = ?,responsibility = ?',['Circle',circle_number,circle_rank,circle_date,circle_area,circle_block_name,circle_space_number,circle_name,circle_author,nickname])//可能有对应上的错误
					    .on('result', function(res) {
					      res.on('row', function(row) {
					       console.log('main_add_circle_server_insert:成功');
					      })
					      .on('error', function(err) {
					      	socket.emit('alert_client',6,0);
					        console.log('main_add_circle_server_insert:发生异常错误:' + inspect(err));
					      })
					      .on('end', function(info) {
					      	socket.emit('alert_client',6,1);
					        console.log('main_add_circle_server_insert:完毕');
					      })
					    })
					    .on('end', function() {
					      console.log('main_add_circle_server_insert:结果输出完毕');
					    });
                	}else{
                		socket.emit('alert_client',6,0);
                	};
              	};//	for ending
	          })
	          .on('error', function(err) {
	            console.log('main_add_circle_server:发生异常错误:' + inspect(err));
	          })
	          .on('end', function(info) {
	            console.log('main_add_circle_server:完毕');
	          })
	        })
	        .on('end', function() {
	          console.log('main_add_item_server:结果输出完毕');
	        });//	query ending
        });//	socket.on('main_add_item_server') ending

/////////////////////////function_part//////////////////////////
function write_new_group(new_group_data,nickname){
  c.query('INSERT INTO groups SET group_name = ?,group_password = ?,group_introduction = ?',[new_group_data['group_name'],new_group_data['group_password'],new_group_data['group_introduction']])
       .on('result', function(res) {
         res.on('row', function(row) {
         })
         .on('error', function(err) {
           socket.emit('alert_client',5,0);
           console.log('write_new_group:发生异常错误:' + inspect(err));
         })
         .on('end', function(info) {
           console.log('write_new_group:完毕');
         })
       })
       .on('end', function() {
         console.log('write_new_group:结果输出完毕');
       });

       c.query('UPDATE groups SET '+nickname+'= ? WHERE group_name = ?',['leader',new_group_data['group_name']])
        .on('result', function(res) {
           res.on('row', function(row) {
             // socket.emit('main_manage_group_add_client',1);
           })
           .on('error', function(err) {
            socket.emit('alert_client',5,0);
            console.log('write_new_group_update:发生异常错误:' + inspect(err));
           })
           .on('end', function(info) {
             console.log('write_new_group_update:完毕');
            c.query('CREATE TABLE IF NOT EXISTS \`'+new_group_data['group_name']+'_circle\` ( i1 text ,i2 text ,i3 text ,i4 text ,i5 text ,i6 text ,i7 text ,i8 text ,i9 text ,i10 text ,i11 text ,i12 text ,i13 text ,i14 text ,i15 text ,i16 text ,i17 text ,i18 text ,i19 text ,i20 text ,i21 text ,i22 text ,i23 text ,i24 text ,i25 text ,i26 text ,i27 text,responsibility text)CHARSET=utf8')
              .on('result', function(res) {
                 res.on('row', function(row) {
                 })
                 .on('error', function(err) {
                  socket.emit('alert_client',5,0);
                  console.log('write_new_group_create_circle:发生异常错误:' + inspect(err));
                 })
                 .on('end', function(info) {
                //  	c.query('ALTER TABLE \`'+new_group_data['group_name']+'_circle\` ADD '+nickname+' text')//233
		              // .on('result', function(res) {
		              //    res.on('row', function(row) {
		              //    })
		              //    .on('error', function(err) {
		              //     socket.emit('alert_client',5,0);
		              //     console.log('write_new_group_alter_circle:发生异常错误:' + inspect(err));
		              //    })
		              //    .on('end', function(info) {
//		                   socket.emit('alert_client',5,1);
		              //      console.log('write_new_group_alter_circle:完毕');
		              //    })
		              //  })
		              //  .on('end', function() {
		              //    console.log('write_new_group_alter_circle:结果输出完毕');
		              //  });
                   console.log('write_new_group_create_circle:完毕');
                 })
               })
               .on('end', function() {
                 console.log('write_new_group:结果输出完毕');
               });

            c.query('CREATE TABLE IF NOT EXISTS \`'+new_group_data['group_name']+'_data\` (name text ,price text,circle_id text,\`'+nickname+'\` text)CHARSET=utf8')
                 .on('result', function(res) {
                   res.on('row', function(row) {
                    console.log('write_new_group_create_data:成功');
                   })
                   .on('error', function(err) {
                     socket.emit('alert_client',5,0);
                     console.log('write_new_group_create_data:发生异常错误:' + inspect(err));
                   })
                   .on('end', function(info) {
                     console.log('write_new_group_create_data:完毕');
                     socket.emit('alert_client',5,1);
                   })
                 })
                 .on('end', function() {
                   console.log('write_new_group_create_data:结果输出完毕');
                 });

           })
         })
         .on('end', function() {
           console.log('write_new_group:结果输出完毕');
         });

};

function select_itemdata (dataobject){

  c.query('SELECT * FROM itemdata WHERE i2 = ?',[dataobject['i2']])
     .on('result', function(res) {
       res.on('row', function(row) {
        console.log('得到itemid记录'+dataobject['i2']);
        console.log('得到所有用户记录'+inspect(dataobject));
        socket.emit('main_mission_list_client',row,dataobject); //row是itemdata里的一列值组成的对象;dataobject={ i2: itemid, nickname: '{nickname:1,finish:0}' }
       })
       .on('error', function(err) {
         console.log('发生异常错误:' + inspect(err));
       })
       .on('end', function(info) {
         console.log('完毕');
       })
     })
     .on('end', function() {
       console.log('结果输出完毕');
     });
};

function select_itemdata_for_calc (dataobject){

  c.query('SELECT * FROM itemdata WHERE i2 = ?',[dataobject['i2']])
     .on('result', function(res) {
       res.on('row', function(row) {
        console.log('测试'+inspect(row)+'dataobject:'+inspect(dataobject));
        socket.emit('main_calc_client',row,dataobject); //row是itemdata里的一列值组成的对象;dataobject={ i2: itemid, nickname: '{nickname:1,finish:0}' }
       })
       .on('error', function(err) {
         console.log('发生异常错误:' + inspect(err));
       })
       .on('end', function(info) {
         console.log('完毕');
       })
     })
     .on('end', function() {
       console.log('结果输出完毕');
     });
};

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


function update_relation(nickname,itemid,buyobjectstring){ //nickname昵称对应宝物的所有者,itemid宝物唯一识别码,buyobjectstring是字符串形式的对象

c.query('SELECT COUNT(i2)=0 FROM relation WHERE i2 = ?',[itemid]) //检查关系表,在没有同样itemid的时候输出1
         .on('result', function(res) {
           res.on('row', function(row) {
            console.log('查到的结果是:' + inspect(row));
             for (x in row){
                is_checked = row[x];
                if (row[x] == 1) {
                  console.log('itemid没有重复'+itemid);
                  console.log('开始INSERT');
                  console.log(nickname+','+buyobjectstring+','+itemid);
                  // INSERT
                  c.query('INSERT INTO relation SET '+nickname+'= ?,i2 = ?',[buyobjectstring,itemid])
                           .on('result', function(res) {
                             res.on('row', function(row) {
                              console.log('update_relation:关系表INSERT更新的结果是:' + inspect(row));
                              socket.emit('main_csv_submit_client',itemid);
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
                }else {
                  console.log('itemid重复了:' + itemid);
                  console.log('那么开始UPDATE');
                  console.log(nickname+','+buyobjectstring+','+itemid);
                  // UPDATE
                  // buyobjectstring = "'"+buyobjectstring+"'";
                  c.query('UPDATE relation SET '+nickname+'= ? WHERE i2 = ?',[buyobjectstring,itemid])
                           .on('result', function(res) {
                             res.on('row', function(row) {
                              console.log('update_relation:关系表UPDATE更新的结果是:' + inspect(row));
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
              };
           })
           .on('error', function(err) {
             console.log('查找同样itemid发生异常错误:' + inspect(err));
           })
           .on('end', function(info) {
             console.log('查找同样itemid完毕');
           });
         })
         .on('end', function() {
           console.log('所有结果输出完毕');
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



}); //socket.listen ending


//SQL模板

// c.query('')
//  .on('result', function(res) {
//    res.on('row', function(row) {
//     console.log('成功');
//    })
//    .on('error', function(err) {
//      console.log('发生异常错误:' + inspect(err));
//    })
//    .on('end', function(info) {
//      console.log('完毕');
//    })
//  })
//  .on('end', function() {
//    console.log('结果输出完毕');
//  });