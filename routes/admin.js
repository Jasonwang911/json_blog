var express = require('express');
var router = express.Router();
// cookie 和 session
var cookieParser = require('cookie-parser');
var session = require('express-session');
// 配置文件
var config = require('./../config/index');
// JWT 相关npm包
var jwt = require('jsonwebtoken');
var expressJwt = require('express-jwt');
var mysql = require('mysql');
// 图形验证码
var svgCaptcha = require('svg-captcha');


//这里传入了一个密钥加session id
router.use(cookieParser('Jason'));
//使用就靠这个中间件
router.use(session({ secret: 'Jason', proxy: true, resave: false, saveUninitialized: false}));

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
  path: ['/admin/login', '/admin/getToken', '/admin/index', '/admin/captcha']  //除了这些地址，其他的URL都需要验证
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


/*
*   图片验证码接口   
*
*/
router.get('/captcha', function(req, res) {
  const cap = svgCaptcha.create({
    size: 4, // 验证码长度
    ignoreChars: '0o1i', // 验证码字符中排除 0o1i
    noise: 2,    // 干扰线数量
    color: false ,   // 是否设置背景色
    // background: 'skyblue'
  });
  req.session.CAPTCHA_KEY = cap.text.toLowerCase();
  res.type('svg');
  res.send(cap.data);
})

/*
*   后台管理登录接口
* 
*/
router.post('login', function( req, res) {
    res.json({
      code: 0,
      message: '登录成功'
    })
})

/* GET users listing. */
router.post('/index', function(req, res) {
  if(req.body.cap == req.session.CAPTCHA_KEY) {
    res.json({
      code: 0,
      message: '图形验证码正确，欢迎来到Jason博客后台管理！'
    });
  }else {
    res.json({
      code: 0,
      message: '图形验证码错误，请重新输入'
    });
  }
});

module.exports = router;
