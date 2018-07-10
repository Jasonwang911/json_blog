var createError = require('http-errors');
var express = require('express');
var cors = require('cors');
// var config = require('./config/index');
var path = require('path');
// JWT 相关npm包
// var jwt = require('jsonwebtoken');
// var expressJwt = require('express-jwt');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
// 日志
var logger = require('morgan');


var indexRouter = require('./routes/index');
var adminRouter = require('./routes/admin');

var app = express();

var corsOptions = {
  origin: ['http://localhost:8080', 'http://localhost:9527'],
  // origin: 'http://localhost:8080', //只有 localhost:8080可以访问
  credentials: true
}

app.use(cors(corsOptions));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
// 配置静态文件存放地址
// app.use(multerObj.any());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/admin', adminRouter);


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
