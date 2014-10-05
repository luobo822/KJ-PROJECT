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

var a = '`'+"test1213123"+'`';
 c.query('CREATE TABLE IF NOT EXISTS '+a+' ( i1 text ,i2 text ,i3 text ,i4 text ,i5 text ,i6 text ,i7 text ,i8 text ,i9 text ,i10 text ,i11 text ,i12 text ,i13 text ,i14 text ,i15 text ,i16 text ,i17 text ,i18 text ,i19 text ,i20 text ,i21 text ,i22 text ,i23 text ,i24 text ,i25 text ,i26 text ,i27 text)CHARSET=utf8')
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

c.end();
