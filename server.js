var fs = require('fs');
var http = require('http');
var inspect = require('util').inspect;
var socketio = require('socket.io');
var Client = require('mariasql');

var c = new Client();

var server = http.createServer(function(req, res) {
	res.writeHead(200, {
		'Content-type': 'text/html'
	});
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



socketio.listen(server).on('connection', function(socket) {
	//requset
	socket.on('request_read_server', function() {
		//		console.log('requset_read_server:收到要求数据库推送请求');
		c.query('SELECT * FROM request')
			.on('result', function(res) {
				res.on('row', function(row) {
						console.log(inspect(row));
						socket.emit('request_read_client', row);
					})
					.on('error', function(err) {
						console.log('requset_read_server:发生异常错误:' + inspect(err));
					})
					.on('end', function(info) {
						//						console.log('requset_read_server:完毕');
					})
			})
			.on('end', function() {
				//				console.log('requset_read_server:结果输出完毕');
			});
	});

	socket.on('request_write_server', function(text) {
		//		console.log('requset_write_server:收到要求数据库写入请求');
		var d = new Date();
		//		console.log(d.toString());
		c.query('INSERT INTO request SET time = ?,text = ?', [d.toString(), text])
			.on('result', function(res) {
				res.on('row', function(row) {
						//						console.log(inspect(row));
						socket.emit('request_read_client', row);
					})
					.on('error', function(err) {
						console.log('requset_write_server:发生异常错误:' + inspect(err));
					})
					.on('end', function(info) {
						//						console.log('requset_write_server:完毕');
					})
			})
			.on('end', function() {
				//				console.log('requset_write_server:结果输出完毕');
			});
	});

	//reg

	socket.on('reg_check_username_server', function(uzndata) {
		//		console.log('reg_check_username_server:收到需检查的用户名:', uzndata);
		var is_checked = -1;
		c.query('SELECT COUNT(username)=0 FROM user WHERE username = :username', uzndata) //检查数据库,在没有重名的时候输出1
			.on('result', function(res) {
				res.on('row', function(row) {
						//						console.log('reg_check_username_server:查到的结果是:' + inspect(row));
						for (x in row) {
							is_checked = row[x];
							if (row[x] == 1) {
								//								console.log('reg_check_username_server:用户名没有重复' + uzndata.username);
							} else {
								//								console.log('reg_check_username_server:用户名重复了:' + uzndata.username);
							};
							socket.emit('reg_check_username_client', is_checked); //重名向客户端发送0,未重名发送1
						};
					})
					.on('error', function(err) {
						console.log('reg_check_username_server:查找重名发生异常错误:' + inspect(err));
					})
					.on('end', function(info) {
						//						console.log('reg_check_username_server:查找重名完毕');
					});
			})
			.on('end', function() {
				//				console.log('reg_check_username_server:所有结果输出完毕');
			});
	});

	socket.on('reg_check_nickname_server', function(nickname) {
		//		console.log('reg_check_nickname_server:收到需检查的昵称:', nickname);
		var is_checked = -1;
		c.query('SELECT COUNT(nickname)=0 FROM user WHERE nickname = ?', [nickname]) //检查数据库,在没有重名的时候输出1
			.on('result', function(res) {
				res.on('row', function(row) {
						is_checked = row['COUNT(nickname)=0'];
						// if (row['COUNT(nickname)=0'] == 1) {
						// 	//								console.log('reg_check_nickname_server:昵称没有重复' + nickname);
						// } else {
						// 	//								console.log('reg_check_nickname_server:昵称重复了:' + nickname);
						// };
						socket.emit('reg_check_nickname_client', is_checked); //重名向客户端发送0,未重名发送1
					})
					.on('error', function(err) {
						console.log('reg_check_nickname_server:查找重名发生异常错误:' + inspect(err));
					})
					.on('end', function(info) {
						//						console.log('reg_check_nickname_server:查找重名完毕');
					});
			})
			.on('end', function() {
				//				console.log('reg_check_nickname_server:所有结果输出完毕');
			});
	});

	socket.on('reg_submit_server', function(regdata) {
		c.query('INSERT INTO user SET id = ?, username = ?, password = ?, email = ?, qq = ?, nickname = ?, sq = ?, isq = ? ,power = ?', [regdata.id, regdata.username, regdata.password, regdata.email, regdata.qq, regdata.nickname, regdata.sq, regdata.isq, 0])
			.on('result', function(res) {
				res.on('row', function(row) {
						//						console.log('注册的结果是:' + inspect(row));
					})
					.on('error', function(err) {
						console.log('发生异常错误:' + inspect(err));
					})
					.on('end', function(info) {
						//						console.log('添加完毕');
					});
			})
			.on('end', function() {
				//				console.log('所有结果输出完毕');
			});

		c.query('ALTER TABLE groups ADD \`' + regdata.nickname + '\` text')
			.on('result', function(res) {
				res.on('row', function(row) {
						//						console.log('alter_group:加入新用户字段的结果是:' + inspect(row));
					})
					.on('error', function(err) {
						console.log('alter_group:发生异常错误:' + inspect(err));
					})
					.on('end', function(info) {
						//						console.log('alter_group:新用户字段添加完毕');
					});
			})
			.on('end', function() {
				//				console.log('alter_group:所有结果输出完毕');
			});

		socket.emit('reg_submit_client', regdata); //如果成功插入数据,返回对象.
	});

	//login

	socket.on('login_server', function(logindata) {
		//		console.log('收到登录data:', logindata);
		var is_right = -1;
		c.query('SELECT COUNT(username)=1 FROM user WHERE id = :id AND username = :username', logindata)
			.on('result', function(res) {
				res.on('row', function(row) {
						//						console.log('查到的结果是:' + inspect(row));
						for (x in row) {
							is_right = row[x];
							if (row[x] == 1) { //若id和用户名正确,进行第二遍查询,查出这个用户的所有数据
								//								console.log('允许登录' + logindata.username);
								c.query('SELECT * FROM user WHERE id = :id AND username = :username', logindata)
									.on('result', function(res) {
										res.on('row', function(row) {
												row.flag = is_right;
												//												console.log('输出row' + inspect(row));
												socket.emit('login_client', row); //允许登录flag=1/不允许登录flag=0/发生错误flag=-1
											})
											.on('error', function(err) {
												console.log('结果输出错误: ' + inspect(err));
											})
											.on('end', function(info) {
												//												console.log('结果输出成功');
											});
									})
									.on('end', function() {
										//										console.log('所有结果输出完毕');
									});
							} else {
								//								console.log('不允许登录,没有此用户或密码错误:' + logindata.username);
								row.flag = 0;
								socket.emit('login_client', row); //允许登录flag=1/不允许登录flag=0/发生错误flag=-1
							};
						};
					})
					.on('error', function(err) {
						console.log('登录程序发生异常错误:' + inspect(err));
					})
					.on('end', function(info) {
						//						console.log('登录处理完毕');
					});
			})
			.on('end', function() {
				//				console.log('所有结果输出完毕');
			});
	});

	//main

	socket.on('main_message_server', function(msgdata) {
		//		console.log('main_message_server:收到消息:', msgdata);
		socket.broadcast.emit('message', msgdata);
	});

	socket.on('main_csv_submit_server', function(csvdata, which_group, nickname, circle_id) { //csvdata是一个数组
		//console.log(circle_id);
		c.query('SELECT COUNT(circle_id)=0 FROM \`' + which_group + '_circle\` WHERE circle_id = ?', [circle_id])
			.on('result', function(res) {
				res.on('row', function(row) {
						if (row['COUNT(circle_id)=0'] == 1) { //which_group_circle表里没有此circle,不重复
							insert_circle(csvdata, which_group, nickname, circle_id); //传csvdata[],11.12删除了csvdata 中的 nickname
							//1203
						} else {
							socket.emit('main_csv_submit_client', 0);
						};
					})
					.on('error', function(err) {
						console.log('main_csv_submit_server:发生异常错误:' + inspect(err));
						socket.emit('main_csv_submit_client', -1);
					})
					.on('end', function(info) {
						//
					});
			})
			.on('end', function() {
				//
			});

	});

	socket.on('main_mission_list_server', function(nickname, which_group) {
		c.query('SELECT * FROM \`' + which_group + '_circle\` ')
			.on('result', function(res) {
				res.on('row', function(row) {

						var is_pushed = 0; //为0说明还没有推送过circle数据，为其他值就说明推送过circle数据了,对行circle数据新建一个
						var circle_data = row; //temp存储的是一行circle数据
						var relation_data = "";

						c.query('SELECT * FROM \`' + which_group + '_data\` WHERE circle_id = ?', [circle_data['circle_id']])
							.on('result', function(res) {
								res.on('row', function(row) {
										relation_data = row;
										if (relation_data[nickname] == null) { //true:这个item和self没关系，则push到“其他任务”里,完整的circle和relation数据
											var relation_data_temp = relation_data; //q是一个临时容器；它防止在查询的时候，relation_data的值被外部代码，异步改掉而出错；
											c.query('SELECT COUNT(' + nickname + ')=0 FROM \`' + which_group + '_data\` WHERE circle_id = ?', [relation_data['circle_id']])
												.on('result', function(res) {
													res.on('row', function(row) {
															var temp = "COUNT(" + nickname + ")=0";
															if (row[temp] == '1') {
																if (is_pushed == 0) {
																	socket.emit('main_mission_list_client', relation_data_temp, circle_data, 1);
																	is_pushed = 1;
																};
															} else {
																if (is_pushed == 1) { //true:已推送过circle数据,只推送circleid和完整的relation
																	socket.emit('main_mission_list_client', relation_data_temp, circle_data['circle_id'], 0);
																} else { //未推送过circle数据,推送完整的circle数据和完整的relation数据
																	socket.emit('main_mission_list_client', relation_data_temp, circle_data, 0);
																	is_pushed = 1;
																};
															};
														})
														.on('error', function(err) {
															console.log('发生异常错误:' + inspect(err));
														})
														.on('end', function(info) {
															//															console.log('完毕');
														})
												})
												.on('end', function() {
													//													console.log('结果输出完毕');
												});

										} else { //push to finished or unfinished
											if (is_pushed == 1) { //true:已推送过circle数据,只推送circleid和完整的relation
												socket.emit('main_mission_list_client', relation_data, circle_data['circle_id'], 0);
											} else { //未推送过circle数据,推送完整的circle数据和完整的relation数据
												socket.emit('main_mission_list_client', relation_data, circle_data, 0);
												is_pushed = 1;
											};
										};
									})
									.on('error', function(err) {
										console.log('main_mission_list_server:发生异常错误:' + inspect(err));
									})
									.on('end', function(info) {})
							})
							.on('end', function() {
								if (!relation_data) { //true:不带item的circle,进othermission
									socket.emit('main_mission_list_client', "", circle_data, 1);
								};
							});

					})
					.on('error', function(err) {
						//						console.log('main_mission_list_server:发生异常错误:' + inspect(err));
					})
					.on('end', function(info) {
						//						console.log('main_mission_list_server:推送完毕');
					})
			})
			.on('end', function() {
				//								console.log('main_mission_list_server:结果输出完毕');
			});

	}); //socket.on('main_mission_list_server') ending

	socket.on('main_circle_finish_server', function(flag, circle_id, groupname) {
		if (flag) { //将此circle设为已完成
			c.query('UPDATE \`' + groupname + '_circle\` SET i27 = ? WHERE circle_id = ?', ['finished', circle_id])
				.on('result', function(res) {
					res.on('row', function(row) {
							//			       console.log('main_circle_finish_server:成功');
						})
						.on('error', function(err) {
							console.log('发生异常错误:' + inspect(err));
							socket.emit('alert_client', 8, 0);
						})
						.on('end', function(info) {
							//			        console.log('完毕');
							socket.emit('alert_client', 8, 1);
						})
				})
				.on('end', function() {
					//			      console.log('结果输出完毕');
				});
		} else {
			c.query('UPDATE \`' + groupname + '_circle\` SET i27 = ? WHERE circle_id = ?', ['', circle_id])
				.on('result', function(res) {
					res.on('row', function(row) {
							//			       console.log('main_circle_finish_server:成功');
						})
						.on('error', function(err) {
							console.log('发生异常错误:' + inspect(err));
							socket.emit('alert_client', 8, 0);
						})
						.on('end', function(info) {
							//			        console.log('完毕');
							socket.emit('alert_client', 8, 1);
						})
				})
				.on('end', function() {
					//			      console.log('结果输出完毕');
				});

		};
	});

	socket.on('main_change_responsibility_server', function(responsibility_username, itemname, groupname) { //在11.12的修改中，_circle 中的responsibility 变到_data
		c.query('UPDATE \`' + groupname + '_data\` SET responsibility = ? WHERE item_name = ?', [responsibility_username, itemname])
			.on('result', function(res) {
				res.on('row', function(row) {})
					.on('error', function(err) {
						console.log('发生异常错误:' + inspect(err));
						socket.emit("alert_client", 9, 0);
					})
					.on('end', function(info) {
						socket.emit("alert_client", 9, 1);
					})
			})
			.on('end', function() {});
	});


	socket.on('main_edit_data_server', function(edit_data_string, edit_price_number, item_name, nickname, which_group) {
		//		console.log('main_edit_data_server:收到关系表编辑请求,请求的发送用户是' + nickname);
		c.query('UPDATE \`' + which_group + '_data\` SET \`' + nickname + '\`= ?,item_price = ? WHERE item_name = ?', [edit_data_string, edit_price_number, item_name])
			.on('result', function(res) {
				res.on('row', function(row) {
						//						console.log('main_edit_data_server:关系表编辑的结果是' + inspect(row));
					})
					.on('error', function(err) {
						console.log('main_edit_data_server:关系表编辑过程中发生异常错误:' + inspect(err));
						socket.emit("alert_client", 10, 0);
					})
					.on('end', function(info) {
						socket.emit("alert_client", 10, 1);
						//						console.log('main_edit_data_server:关系表编辑结果输出完毕');
					})
			})
			.on('end', function() {
				console.log('main_edit_data_server:关系表和价格编辑结果输出完毕');
			});
	});

	socket.on('main_item_delete_server', function(itemname, which_group) {
		var error = 0;
		c.query('DELETE FROM \`' + which_group + '_data\` WHERE item_name =?', [itemname])
			.on('result', function(res) {
				res.on('row', function(row) {
						//						console.log('成功');
					})
					.on('error', function(err) {
						socket.emit('alert_client', 11, 0);
						console.log('发生异常错误:' + inspect(err));
						error = 1;
					})
					.on('end', function(info) {
						//						console.log('完毕');
					})
			})
			.on('end', function() {
				//				console.log('结果输出完毕');
			});
		if (error == 0) { //无错
			socket.emit('alert_client', 11, 1);
		};
	});

	socket.on('main_circle_delete_server', function(circle_id, which_group) {
		var error = 0;
		c.query('DELETE FROM \`' + which_group + '_circle\` WHERE circle_id =?', [circle_id])
			.on('result', function(res) {
				res.on('row', function(row) {
						//						console.log('成功');
					})
					.on('error', function(err) {
						//						socket.emit('alert_client', 11, 0);
						console.log('发生异常错误:' + inspect(err));
						error = 1;
					})
					.on('end', function(info) {
						c.query('DELETE FROM \`' + which_group + '_data\` WHERE circle_id =?', [circle_id])
							.on('result', function(res) {
								res.on('row', function(row) {
										//						console.log('成功');
									})
									.on('error', function(err) {
										socket.emit('alert_client', 11, 0);
										console.log('发生异常错误:' + inspect(err));
										error = 1;
									})
									.on('end', function(info) {
										//						console.log('完毕');
										if (error == 0) { //无错
											socket.emit('alert_client', 11, 1);
										};
									})
							})
							.on('end', function() {
								//				console.log('结果输出完毕');
							});
					})
			})
			.on('end', function() {
				//				console.log('结果输出完毕');
			});


	});

	socket.on('main_calc_server', function(nickname, which_group, when) {
		//1119开始

		c.query('SELECT MAX(rowid) FROM \`' + which_group + '_data\`')
			.on('result', function(res) {
				res.on('row', function(row) {

						var temprowid = row['MAX(rowid)'];
						console.log("max(rowid)=" + temprowid);

						c.query('SELECT item_name FROM \`' + which_group + '_data\` WHERE rowid = ?', [temprowid])
							.on('result', function(res) {
								res.on('row', function(row) {
										var last_item_name = row['item_name'];

										c.query('SELECT * FROM \`' + which_group + '_data\`')
											.on('result', function(res) {
												res.on('row', function(row) {
														//查询是否已完成，日期是否正确
														var tempItemdata = row;
														c.query('SELECT * FROM \`' + which_group + '_circle\` WHERE circle_id = ?', [tempItemdata['circle_id']])
															.on('result', function(res) {
																res.on('row', function(row) {
																		if ((row['i6'] == when || when == '233') && row['i27'] == 'finished') { //233意味着全部日期都要
																			// console.log(inspect(tempItemdata));
																			if (tempItemdata['item_name'] == last_item_name) { //true:说明这是最后一行。可以输出结算结果啦！
																				console.log("说明这是最后一行。可以输出结算结果啦！");
																				console.log(inspect(tempItemdata));
																				socket.emit('main_calc_client', tempItemdata, 1);
																			} else { //branch:这说明这不是最后一行，不能输出结算结果
																				console.log("这说明这不是最后一行，不能输出结算结果");
																				console.log(inspect(tempItemdata));
																				socket.emit('main_calc_client', tempItemdata, 0);
																			};
																		};
																	})
																	.on('error', function(err) {
																		console.log('发生异常错误:' + inspect(err));
																	})
																	.on('end', function(info) {
																		//										console.log('完毕');
																	})
															})
															.on('end', function() {
																//								console.log('结果输出完毕');
															});
													})
													.on('error', function(err) {
														console.log('发生异常错误:' + inspect(err));
													})
													.on('end', function(info) {
														//		        console.log('完毕');
													})
											})
											.on('error', function(err) {
												console.log('发生异常错误:' + inspect(err));
											})
											.on('end', function(info) {
												//      console.log('完毕');
											})
									})
									.on('end', function() {
										//    console.log('结果输出完毕');
									});

								//取得了最后一行的itemname,then推送到client,若下边收到的itemname = 这里推送的itemname，说明calc数据的推送全部结束了！然后就可以愉悦的输出结果啦！

							})
							.on('end', function() {
								//						      console.log('结果输出完毕');
							});

					})
					.on('error', function(err) {
						console.log('发生异常错误:' + inspect(err));
					})
					.on('end', function(info) {
						// console.log('完毕');
					})
			})
			.on('end', function() {
				// console.log('结果输出完毕');
			});
	}); //socket.on('main_calc_server') ending

	//1119结束

	socket.on('main_select_group_server', function(nickname) {
		//		console.log('main_select_group_server:收到队伍推送请求,请求的发送用户是' + nickname);
		c.query('SELECT * FROM groups')
			.on('result', function(res) {
				res.on('row', function(row) {
						delete row['group_password'];
						socket.emit('main_select_group_client', row);
						//						console.log('main_select_group_server:向客户端推送成功' + inspect(row));
					})
					.on('error', function(err) {
						console.log('main_select_group_server:发生异常错误:' + inspect(err));
					})
					.on('end', function(info) {
						//						console.log('main_select_group_server:推送完毕');
					})
			})
			.on('end', function() {
				//				console.log('main_select_group_server:结果输出完毕');
			});

	}); //socket.on('main_select_group_server') ending

	socket.on('main_manage_group_add_server', function(new_group_data, nickname) {
		//		console.log('main_manage_group_add_server:收到新队伍创建请求,请求的发送用户是' + nickname);
		//		var error =0;
		c.query('SELECT COUNT(group_name)=0 FROM groups WHERE group_name = ?', [new_group_data['group_name']])
			.on('result', function(res) {
				res.on('row', function(row) {
						for (var temp in row) {
							if (row[temp] == 1) {
								//								console.log('main_manage_group_add_server:队伍名字没有重复:' + new_group_data['group_name']);
								write_new_group(new_group_data, nickname);
							} else {
								//								console.log('main_manage_group_add_server:队伍名字重复了:' + new_group_data['group_name']);
								socket.emit('alert_client', 5, 0);
							};
						};
					})
					.on('error', function(err) {
						console.log('main_manage_group_add_server:发生异常错误:' + inspect(err));
					})
					.on('end', function(info) {
						//						console.log('main_manage_group_add_server:推送完毕');
					})
			})
			.on('end', function() {
				console.log('main_manage_group_add_server:结果输出完毕');
			});

	}); //socket.on('main_manage_group_add_server') ending

	socket.on('main_op_group_server', function(nickname, op_type, now_group, group_password, group_introduction, new_group_name) {
		switch (op_type) {
			case 1:
				console.log("main_op_group_server_join:收到加入队伍请求:" + nickname + "将加入" + now_group);
				var error = 0;
				c.query('SELECT group_password FROM groups WHERE group_name = ?', [now_group])
					.on('result', function(res) {
						res.on('row', function(row) {
								if (row['group_password'] == group_password) {
									c.query('UPDATE groups SET \`' + nickname + '\` = ? WHERE group_name = ?', ['member', now_group])
										.on('result', function(res) {
											res.on('row', function(row) {})
												.on('error', function(err) {
													error = 1;
													console.log('main_op_group_server_join_update:发生异常错误:' + inspect(err));
												})
												.on('end', function(info) {
													//													console.log('main_op_group_server_join_update:推送完毕');
												})
										})
										.on('end', function() {
											c.query('ALTER TABLE \`' + now_group + '_data\` ADD ' + nickname + ' text')
												.on('result', function(res) {
													res.on('row', function(row) {})
														.on('error', function(err) {
															socket.emit('alert_client', 1, 0);
															error = 1;
															console.log('join_group_alter_data:发生异常错误:' + inspect(err));
														})
														.on('end', function(info) {
															if (!error) {
																socket.emit('alert_client', 1, 1);
															};
														})
												})
												.on('end', function() {
													//													console.log('join_group_alter_data:结果输出完毕');
												});
											//											console.log('main_op_group_server_join_update:结果输出完毕');
										});
								} else {
									socket.emit("alert_client", 1, 0);
								};
								//								console.log('main_op_group_server_join:向客户端推送成功' + inspect(row));
							})
							.on('error', function(err) {
								console.log('main_op_group_server_join:发生异常错误:' + inspect(err));
							})
							.on('end', function(info) {
								//								console.log('main_op_group_server_join:推送完毕');
							})
					})
					.on('end', function() {
						console.log('main_op_group_server_join:结果输出完毕');
					});
				break;

			case 2:
				console.log("main_op_group_server_exit:收到退出队伍请求:" + nickname + "将退出" + now_group);
				var error = 0;
				c.query('UPDATE groups SET \`' + nickname + '\` = ? WHERE group_name = ?', [null, now_group])
					.on('result', function(res) {
						res.on('row', function(row) {
								//								console.log('main_op_group_server_exit:向客户端推送成功' + inspect(row));
							})
							.on('error', function(err) {
								socket.emit('alert_client', 2, 0);
								error = 1;
								console.log('main_op_group_server_exit:发生异常错误:' + inspect(err));
							})
							.on('end', function(info) {
								c.query('UPDATE \`' + now_group + '_data\` SET responsibility = ? WHERE responsibility = ?', [null, nickname])
									.on('result', function(res) {
										res.on('row', function(row) {
												//												console.log('main_op_group_server_exit_drop:成功');
											})
											.on('error', function(err) {
												socket.emit('alert_client', 2, 0);
												error = 1;
												console.log('main_op_group_server_exit_drop:发生异常错误:' + inspect(err));
											})
											.on('end', function(info) {
												//			                socket.emit('alert_client',2,1);
												//												console.log('main_op_group_server_exit_drop:完毕');
											})
									})
									.on('end', function() {
										//										console.log('main_op_group_server_exit_drop:结果输出完毕');
									});

								c.query('ALTER TABLE \`' + now_group + '_data\` DROP \`' + nickname + '\`')
									.on('result', function(res) {
										res.on('row', function(row) {
												console.log('main_op_group_server_exit_drop:成功');
											})
											.on('error', function(err) {
												socket.emit('alert_client', 2, 0);
												error = 1;
												console.log('main_op_group_server_exit_drop:发生异常错误:' + inspect(err));
											})
											.on('end', function(info) {
												if (!error) {
													socket.emit('alert_client', 2, 1);
												};
												//												console.log('main_op_group_server_exit_drop:完毕');
											})
									})
									.on('end', function() {
										//										console.log('main_op_group_server_exit_drop:结果输出完毕');
									});

								//								console.log('main_op_group_server_exit:推送完毕');
							})
					})
					.on('end', function() {
						//						console.log('main_op_group_server_exit:结果输出完毕');
					});
				break;

			case 3:
				var error = 0;
				console.log("main_op_group_server_delete:收到解散队伍请求:" + nickname + "将解散" + now_group);
				c.query('SELECT \`' + nickname + '\` FROM groups WHERE group_name = ?', [now_group])
					.on('result', function(res) {
						res.on('row', function(row) {
								//								if (row[nickname] == 'leader') {
								//									//									console.log("此人是leader,允许解散");
								//								};
								// console.log('main_op_group_server_delete_select:向客户端推送成功'+inspect(row));
								c.query('DELETE FROM groups WHERE group_name = ?', [now_group])
									.on('result', function(res) {
										res.on('row', function(row) {
												// console.log('main_op_group_server_delete:向客户端推送成功'+inspect(row));
											})
											.on('error', function(err) {
												//												console.log("DELETE行出错");
												error = 1;
												socket.emit('alert_client', 3, 0);
												console.log('main_op_group_server_delete:发生异常错误:' + inspect(err));
											})
											.on('end', function(info) {
												//DROP表
												c.query('DROP TABLE IF EXISTS \`' + now_group + '_circle\`')
													.on('result', function(res) {
														res.on('row', function(row) {
																//																console.log('main_op_group_server_delete_drop:已删除表' + inspect(row));
															})
															.on('error', function(err) {
																//																console.log("DROP出错")
																error = 1;
																socket.emit('alert_client', 3, 0);
																console.log('main_op_group_server_delete_drop:删除表出错:' + inspect(err));
															})
															.on('end', function(info) {
																//																console.log('main_op_group_server_delete_drop:删除表结束');
															})
													})
													.on('end', function() {
														//														console.log('main_op_group_server_delete_drop:结果输出完毕');
													});

												c.query('DROP TABLE IF EXISTS \`' + now_group + '_data\`')
													.on('result', function(res) {
														res.on('row', function(row) {
																//																console.log('main_op_group_server_delete_drop:已删除表' + inspect(row));
															})
															.on('error', function(err) {
																//																console.log("DROP出错")
																error = 1;
																socket.emit('alert_client', 3, 0);
																console.log('main_op_group_server_delete_drop:删除表出错:' + inspect(err));
															})
															.on('end', function(info) {
																//																console.log('main_op_group_server_delete_drop:删除表结束');
															})
													})
													.on('end', function() {
														//														console.log('main_op_group_server_delete_drop:结果输出完毕');
													});
												//DROP表结束
											})
									}) //result ending
									.on('end', function() {
										//										console.log('main_op_group_server_delete:结果输出完毕');
									});

							}) //result ending
							.on('error', function(err) {
								socket.emit('alert_client', 3, 0);
								console.log('main_op_group_server_delete_select:发生异常错误:' + inspect(err));
							})
							.on('end', function(info) {
								if (!error) {
									socket.emit('alert_client', 3, 1);
								};
								//								console.log('main_op_group_server_delete_select:推送完毕');
							})
					})
					.on('end', function() {
						//						console.log('main_op_group_server_delete_select:结果输出完毕');
					});
				break;

			case 4:
				//				console.log("main_op_group_server_rewrite:收到队伍信息覆写请求");
				var error = 0;
				c.query('SELECT \`' + nickname + '\` FROM groups WHERE group_name = ?', [now_group])
					.on('result', function(res) {
						res.on('row', function(row) {
								// socket.emit('alert_client',4,1);
								if (row[nickname] == 'leader') {
									//									console.log("此人是leader,允许覆写");
									c.query('UPDATE groups SET group_name = ?,group_password = ?,group_introduction = ? WHERE group_name = ?', [new_group_name, group_password, group_introduction, now_group])
										.on('result', function(res) {
											res.on('row', function(row) {})
												.on('error', function(err) {
													socket.emit('alert_client', 4, 0);
													error = 1;
													console.log('main_op_group_server_update:发生异常错误:' + inspect(err));
												})
												.on('end', function(info) {
													//													console.log('main_op_group_server_update:推送完毕');
													if (new_group_name != now_group) {
														//重命名表
														c.query('RENAME TABLE \`' + now_group + '_circle\` TO \`' + new_group_name + '_circle\`')
															.on('result', function(res) {
																res.on('row', function(row) {})
																	.on('error', function(err) {
																		console.log('main_op_group_server_rename:发生异常错误:' + inspect(err));
																	})
																	.on('end', function(info) {
																		//																		console.log('main_op_group_server_rename:推送完毕');
																	})
															})
															.on('end', function() {
																//																console.log('main_op_group_server_rename:结果输出完毕');
															});

														c.query('RENAME TABLE \`' + now_group + '_data\` TO \`' + new_group_name + '_data\`')
															.on('result', function(res) {
																res.on('row', function(row) {})
																	.on('error', function(err) {
																		socket.emit('alert_client', 4, 0);
																		error = 1;
																		console.log('main_op_group_server_rename:发生异常错误:' + inspect(err));
																	})
																	.on('end', function(info) {
																		//																		console.log('main_op_group_server_rename:推送完毕');
																	})
															})
															.on('end', function() {
																//																console.log('main_op_group_server_rename:结果输出完毕');
															});

													}; //  if ending
												}) // previous end ending
										}) // previous result ending
										.on('end', function() {
											//											console.log('main_op_group_server_update:结果输出完毕');
										});
								};

							})
							.on('error', function(err) {
								socket.emit('alert_client', 4, 0);
								error = 1;
								console.log('main_op_group_server_rewrite_select:发生异常错误:' + inspect(err));
							})
							.on('end', function(info) {
								if (!error) {
									socket.emit('alert_client', 4, 1);
								};
								//								console.log('main_op_group_server_rewrite_select:完毕');
							})
					})
					.on('end', function() {
						//						console.log('main_op_group_server_rewrite_select:结果输出完毕');
					});
				break;
		}; //  switch ending
	}); //	socket.on('main_op_group_server') ending

	socket.on('main_add_item_server', function(item_name, item_price, circle_id, item_copy_number, nickname, which_group, responsibility) {
		var error = 0;
		c.query('SELECT COUNT(circle_id)=0 FROM \`' + which_group + '_circle\` WHERE circle_id = ?', [circle_id])
			.on('result', function(res) {
				res.on('row', function(row) {
						if (row['COUNT(circle_id)=0'] != 1) {
							c.query('SELECT COUNT(item_name)=0 FROM \`' + which_group + '_data\` WHERE item_name = ?', [item_name])
								.on('result', function(res) {
									res.on('row', function(row) {
											if (row['COUNT(item_name)=0'] == 1) {
												c.query('INSERT INTO \`' + which_group + '_data\` SET circle_id = ?,item_name = ?, item_price = ?,\`' + nickname + '\` = ? ,responsibility = ?', [circle_id, item_name, item_price, '{"bought":0,"target":' + item_copy_number + '}', responsibility])
													.on('result', function(res) {
														res.on('row', function(row) {})
															.on('error', function(err) {
																error = 1;
																console.log('main_add_item_server_insert:发生异常错误:' + inspect(err));
															})
															.on('end', function(info) {
																if (!error) {
																	socket.emit('alert_client', 6, 1);
																} else {
																	socket.emit('alert_client', 6, 0);
																};
															})
													})
													.on('end', function() {
														//														console.log('main_add_item_server_insert:结果输出完毕');
													});
											} else {
												socket.emit('alert_client', 6, 0);
											};
											//											console.log('main_add_item_server_check:成功');
										})
										.on('error', function(err) {
											error = 1;
											console.log('main_add_item_server_check:发生异常错误:' + inspect(err));
										})
										.on('end', function(info) {
											//											console.log('main_add_item_server_check:完毕');
										})
								})
								.on('end', function() {
									//									console.log('main_add_item_server_check:结果输出完毕');
								});
						} else {
							socket.emit('alert_client', 6, 0);
						};
					})
					.on('error', function(err) {
						socket.emit('alert_client', 6, 0);
						error = 1;
						console.log('main_add_item_server:发生异常错误:' + inspect(err));
					})
					.on('end', function(info) {
						//						console.log('main_add_item_server:完毕');
					})
			})
			.on('end', function() {
				//				console.log('main_add_item_server:结果输出完毕');
			}); //	query ending
	}); //	socket.on('main_add_item_server') ending

	socket.on('main_add_circle_server', function(circle_date, circle_area, circle_block_name, circle_space_number, circle_name, circle_author, circle_space_set, which_group, nickname, circle_id) {
		c.query('SELECT COUNT(circle_id)=0  FROM \`' + which_group + '_circle\` WHERE circle_id = ?', [circle_id])
			.on('result', function(res) {
				res.on('row', function(row) {
						if (row['COUNT(circle_id)=0'] == 1) {
							c.query('INSERT INTO \`' + which_group + '_circle\` SET i1 = ?, circle_id = ? ,i6 = ?,i7 = ?,i8= ?,i9 = ?, i11 = ?, i13 = ?,updater = ?', ['Circle', circle_id, circle_date, circle_area, circle_block_name, circle_space_number, circle_name, circle_author, nickname])
								.on('result', function(res) {
									res.on('row', function(row) {
											//											console.log('main_add_circle_server_insert:成功');
										})
										.on('error', function(err) {
											socket.emit('alert_client', 7, 0);
											console.log('main_add_circle_server_insert:发生异常错误:' + inspect(err));
										})
										.on('end', function(info) {
											socket.emit('alert_client', 7, 1);
											//											console.log('main_add_circle_server_insert:完毕');
										})
								})
								.on('end', function() {
									//									console.log('main_add_circle_server_insert:结果输出完毕');
								});
						} else {
							socket.emit('alert_client', 7, 0);
						};
					})
					.on('error', function(err) {
						console.log('main_add_circle_server:发生异常错误:' + inspect(err));
					})
					.on('end', function(info) {
						//						console.log('main_add_circle_server:完毕');
					})
			})
			.on('end', function() {
				//				console.log('main_add_item_server:结果输出完毕');
			}); //	query ending
	}); //	socket.on('main_add_item_server') ending

	/////////////////////////function_part//////////////////////////

	function write_new_group(new_group_data, nickname) {
		var error = 0;
		c.query('INSERT INTO groups SET group_name = ?,group_password = ?,group_introduction = ?', [new_group_data['group_name'], new_group_data['group_password'], new_group_data['group_introduction']])
			.on('result', function(res) {
				res.on('row', function(row) {})
					.on('error', function(err) {

						error = 1;
						console.log('write_new_group:发生异常错误:' + inspect(err));
					})
					.on('end', function(info) {
						//						console.log('write_new_group:完毕');
					})
			})
			.on('end', function() {
				//				console.log('write_new_group:结果输出完毕');
			});

		c.query('UPDATE groups SET ' + nickname + '= ? WHERE group_name = ?', ['leader', new_group_data['group_name']])
			.on('result', function(res) {
				res.on('row', function(row) {
						// socket.emit('main_manage_group_add_client',1);
					})
					.on('error', function(err) {
						error = 1;
						console.log('write_new_group_update:发生异常错误:' + inspect(err));
					})
					.on('end', function(info) {
						//						console.log('write_new_group_update:完毕');
						c.query('CREATE TABLE IF NOT EXISTS \`' + new_group_data['group_name'] + '_circle\` (rowid int NOT NULL AUTO_INCREMENT,i1 text ,i2 text ,i3 text ,i4 text ,i5 text ,i6 text ,i7 text ,i8 text ,i9 text ,i10 text ,i11 text ,i12 text ,i13 text ,i14 text ,i15 text ,i16 text ,i17 text ,i18 text ,i19 text ,i20 text ,i21 text ,i22 text ,i23 text ,i24 text ,i25 text ,i26 text ,i27 text,updater text,circle_id text,PRIMARY KEY (rowid))CHARSET=utf8') //1126
							.on('result', function(res) {
								res.on('row', function(row) {})
									.on('error', function(err) {
										error = 1;
										console.log('write_new_group_create_circle:发生异常错误:' + inspect(err));
									})
									.on('end', function(info) {
										//										console.log('write_new_group_create_circle:完毕');
									})
							})
							.on('end', function() {
								//								console.log('write_new_group:结果输出完毕');
							});

						c.query('CREATE TABLE IF NOT EXISTS \`' + new_group_data['group_name'] + '_data\` (rowid int NOT NULL AUTO_INCREMENT,item_name text ,item_price text,circle_id text,\`' + nickname + '\` text,responsibility text,PRIMARY KEY (rowid))CHARSET=utf8')
							.on('result', function(res) {
								res.on('row', function(row) {
										//										console.log('write_new_group_create_data:成功');
									})
									.on('error', function(err) {
										error = 1;
										console.log('write_new_group_create_data:发生异常错误:' + inspect(err));
									})
									.on('end', function(info) {
										//										console.log('write_new_group_create_data:完毕');
										if (!error) {
											socket.emit('alert_client', 5, 1);
										} else {
											socket.emit('alert_client', 5, 0);
										};
									})
							})
							.on('end', function() {
								//								console.log('write_new_group_create_data:结果输出完毕');
							});
					})
			})
			.on('end', function() {
				//				console.log('write_new_group:结果输出完毕');
			});

	};


	// function select_itemdata_for_calc(dataobject) { //STOP

	// 	c.query('SELECT * FROM itemdata WHERE i2 = ?', [dataobject['i2']])
	// 		.on('result', function(res) {
	// 			res.on('row', function(row) {
	// 					console.log('测试' + inspect(row) + 'dataobject:' + inspect(dataobject));
	// 					socket.emit('main_calc_client', row, dataobject); //row是itemdata里的一列值组成的对象;dataobject={ i2: itemid, nickname: '{nickname:1,finish:0}' }
	// 				})
	// 				.on('error', function(err) {
	// 					console.log('发生异常错误:' + inspect(err));
	// 				})
	// 				.on('end', function(info) {
	// 					//						console.log('完毕');
	// 				})
	// 		})
	// 		.on('end', function() {
	// 			//				console.log('结果输出完毕');
	// 		});
	// };

	function insert_circle(csvdata, which_group, nickname, circle_id) { //csvdata 为数组
		csvdata.push(nickname); //push入nickname
		csvdata.push(circle_id);
		var error = 0;
		c.query('INSERT INTO \`' + which_group + '_circle\` SET i1 = ?, i2 = ?, i3 = ?, i4 = ?, i5 = ?, i6 = ?, i7 = ?, i8 = ?, i9 = ?, i10 = ?, i11 = ?, i12 = ?,' +
				'i13 = ?, i14 = ?, i15 = ?, i16 = ?, i17 = ?, i18 = ?, i19 = ?, i20 = ?, i21 = ?, i22 = ?, i23 = ?, i24 = ?, i25 = ?, i26 = ?, i27 = ? ,updater = ?,circle_id = ?',
				csvdata) //1116
			.on('result', function(res) {
				res.on('row', function(row) {})
					.on('error', function(err) {
						socket.emit('main_csv_submit_client', -1); //发生错误,返回-1.
						error = 1;
						console.log('insert_circle:发生异常错误:' + inspect(err));
					})
					.on('end', function(info) {
						if (!error) {
							socket.emit('main_csv_submit_client', circle_id); //插入成功,返回circle id
						};
					})
			})
			.on('end', function() {
				//				console.log('insert_circle:item插入结果输出完毕');
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