var express = require('express');
var router = express.Router();
// 配置文件
var config = require('./../config/index');
// JWT 相关npm包
var jwt = require('jsonwebtoken');
var expressJwt = require('express-jwt');
const mysql = require('mysql');

// 后台数据库连接池
const db = mysql.createPool(config.database.admin);

var json = db.query(`SELECT * FROM t_sys_user`, function( err, user) {
  if(err) {
    return err;
  }else {
    return user;
  }
})

// 生成 token
const token = jwt.sign( {userid: json.userid,name: json.username }, config.secret, {
  expiresIn:  60*60*24 //秒到期时间
});

// 验证token的合法性
router.use(expressJwt ({
  secret:  config.secret 
}).unless({
  path: ['/admin/login', '/admin/getToken', '/admin/index']  //除了这些地址，其他的URL都需要验证
}));

// // 拦截器
router.use(function(err, req, res, next) {
  // 当token验证失败时会抛出如下错误
  if(err.name === 'UnauthorizedError') {
    // 返回401
    res.status(401).json({code: 1, message: '无效的token'})
  }
})

// 获取token的接口
router.post('/getToken', function(req, res) {
  res.json({
    code: 0,
    message: 'token获取成功',
    token: token
  })
})

router.post('/userInfo', function(req, res) {
  console.log(req.headers.authorization.split(' ')[1])
  console.log(req.user)
  db.query(`SELECT * FROM t_sys_user`, function( err, user) {
    if(err) {
      res.json({
        code: 0,
        message: '数据库查询失败'
      })
    }else {
      res.json({
        code: 0,
        message: '请求成功',
        userInfo: user
      })
    }
  })
})

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

module.exports = router;
