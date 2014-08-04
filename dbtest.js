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

var a = "2334";
var b = "2334";

c.query('SELECT * FROM user WHERE id = :id AND username = :username',{id:a,username:b})
 .on('result', function(res) {
   res.on('row', function(row) {
     console.log('结果行: ' + inspect(row));
     // console.log('输出id:' +　row.id);
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

c.query('SELECT COUNT(username) FROM user WHERE id = ? AND username = ?',[a, b])
 .on('result', function(res) {
   res.on('row', function(row) {
     console.log('Result row: ' + inspect(row));
     for (x in row)
      {
        console.log(row[x]);
      }
     
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