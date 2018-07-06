var createError = require('http-errors');
var express = require('express');
var config = require('./config/index');
var path = require('path');
// JWT 相关npm包
var jwt = require('jsonwebtoken');
var expressJwt = require('express-jwt');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
// 日志
var logger = require('morgan');


var User = {
  userid: 2,
  name: '浪魁',
  password: '123',
}


// var indexRouter = require('./routes/index');
// var usersRouter = require('./routes/users');

var app = express();
console.log(config.secret)


// 设置superSecret全局参数
app.set('superSecret', config.secret);
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', require('ejs').__express);
app.set('view engine', 'html')

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
// 配置静态文件存放地址
// app.use(multerObj.any());
app.use(express.static(path.join(__dirname, 'public')));

console.log(config.secret)
// 生成 token
const token = jwt.sign(User, config.secret, {
  expiresIn:  60*60*24 //秒到期时间
});

// 验证token的合法性
app.use(expressJwt ({
  secret:  config.secret 
}).unless({
  path: ['/login', '/getUserInfo']  //除了这些地址，其他的URL都需要验证
}));

// // 拦截器
app.use(function(err, req, res, next) {
  // 当token验证失败时会抛出如下错误
  if(err.name === 'UnauthorizedError') {
    // 返回401
    res.status(401).json({code: 1, message: '无效的token'})
  }
})

// 获取token的接口
app.post('/getUserInfo', function(req, res) {
  res.json({
    code: 0,
    message: 'token获取成功',
    token: token
  })
})

app.post('/newList', function(req, res) {
  console.log(req.headers.authorization.split(' ')[1])
  console.log(req.user)
  res.json({
    code: 0,
    message: '请求成功',
    userInfo: req.user
  })
})


// app.use('/', indexRouter);
// app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
