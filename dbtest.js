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

c.query('SELECT COUNT(username) FROM user WHERE id = ? AND username = ?',['233', '244'])
 .on('result', function(res) {
   res.on('row', function(row) {
     
     
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