var inspect = require('util').inspect;
var Client = require('mariasql');
var socketio = require('socket.io');
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

var a = '`'+"test1213123"+'`';
var b = 'baka';
 c.query('UPDATE test SET '+b+'= '+a+' WHERE rowid = ?',[3])
 .on('result', function(res) {
   res.on('row', function(row) {
     console.log(inspect(row));
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


socketio.listen(server).on('connection', function(socket) {})


c.end();
