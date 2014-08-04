var inspect = require('util').inspect;
var Client = require('mariasql');

var c = new Client();

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

var test = {id:'233',username:'233',baka:'244'};

c.query('SELECT COUNT(username)=0 FROM user WHERE id = :id AND username = :username',test)
 .on('result', function(res) {
   res.on('row', function(row) {
    console.log('Result row: ' + inspect(row));
     for (x in row)
      {
        console.log(row[x]);
      }
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

var data = new Object();
data = {
  id:'2',
  username:'3',
  password:'4',
  email:'5',
  qq:'6',
  nickname:'7',
  sq:'8',
  isq:'9'
};


c.query('INSERT INTO user SET id = ?, username = ?, password = ?, email = ?, qq = ?, nickname = ?, sq = ?, isq = ?',[data.id,data.username,data.password,data.email,data.qq,data.nickname,data.sq,data.isq])
 .on('result', function(res) {
   res.on('row', function(row) {
     console.log('插入成功！');
   })
   .on('error', function(err) {
     console.log('Result error: ' + inspect(err));
   })
   .on('end', function(info) {
     console.log('Result finished successfully');
   });
 })
 .on('end', function() {
   console.log('Done with all results');
 });

c.end();