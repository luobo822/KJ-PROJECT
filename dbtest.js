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

// var test = {id:'233',username:'233'};
// var TABLE = 'test'; 

// c.query('SELECT * FROM '+TABLE+' WHERE username = :username',test)
//  .on('result', function(res) {
//    res.on('row', function(row) {
//     console.log('Result row: ' + inspect(row));
//    })
//    .on('error', function(err) {
//      console.log('结果输出错误: ' + inspect(err));
//    })
//    .on('end', function(info) {
//      console.log('结果输出成功');
//    });
//  })
//  .on('end', function() {
//    console.log('所有结果输出完毕');
//  });

// var data = new Array();

// data = [1,2,'笨蛋'];


// c.query('INSERT INTO test SET id = ?, username = ?,'+
//   'baka = ?',
//   data)
//  .on('result', function(res) {
//    res.on('row', function(row) {
//      console.log('插入成功！');
//    })
//    .on('error', function(err) {
//      console.log('Result error: ' + inspect(err));
//    })
//    .on('end', function(info) {
//      console.log('Result finished successfully');
//    });
//  })
//  .on('end', function() {
//    console.log('Done with all results');
//  });
// UserName=@UserName
//

var test ="\"!@#!@#$%^#$%$%^\"";
 c.query('INSERT INTO test SET baka2 ='+',username = ?',['"{"sha":\'"233"}"'])
 .on('result', function(res) {
   res.on('row', function(row) {
        for(x in row){
          console.log(row[x]);
        };
   })
   .on('error', function(err) {
     console.log(err['code']);
   })
   .on('end', function(info) {
     console.log('Result finished successfully');
   });
 })
 .on('end', function() {
   console.log('Done with all results');
 });
c.end();

 // c.query('ALTER TABLE test ADD text')
 // .on('result', function(res) {
 //   res.on('row', function(row) {
 //     console.log(inspect(row));
 //   })
 //   .on('error', function(err) {
 //     console.log('Result error: ' + inspect(err));
 //   })
 //   .on('end', function(info) {
 //     console.log('Result finished successfully');
 //   });
 // })
 // .on('end', function() {
 //   console.log('Done with all results');
 // });

