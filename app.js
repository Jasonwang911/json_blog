var createError = require('http-errors');
var express = require('express');
var cors = require('cors');
// var config = require('./config/index');
var path = require('path');
// ueditor 中间件
var ueditor = require('ueditor');
// JWT 相关npm包
// var jwt = require('jsonwebtoken');
// var expressJwt = require('express-jwt');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
// 日志
var logger = require('morgan');


var indexRouter = require('./routes/font');
var adminRouter = require('./routes/admin');
var wangEditor = require('./routes/wangEditor')

var app = express();

var corsOptions = {
  origin: ['http://localhost:9527', 'http://localhost:8080', 'http://localhost:9528'],
  // origin: 'http://localhost:8080', //只有 localhost:8080可以访问
  credentials: true
}

app.use(cors(corsOptions));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());
// 配置静态文件存放地址
// app.use(multerObj.any());
app.use(express.static(path.join(__dirname, 'public')));

// 配置 ueditor 
app.use("/ueditor/ue", ueditor(path.join(__dirname, 'public'), function (req, res, next) {
  //客户端上传文件设置
  var imgDir = '/img/ueditor/'
   var ActionType = req.query.action;
  if (ActionType === 'uploadimage' || ActionType === 'uploadfile' || ActionType === 'uploadvideo') {
      var file_url = imgDir;//默认图片上传地址
      /*其他上传格式的地址*/
      if (ActionType === 'uploadfile') {
          file_url = '/file/ueditor/'; //附件
      }
      if (ActionType === 'uploadvideo') {
          file_url = '/video/ueditor/'; //视频
      }
      res.ue_up(file_url); //你只要输入要保存的地址 。保存操作交给ueditor来做
      res.setHeader('Content-Type', 'text/html');
  }
  //  客户端发起图片列表请求
  else if (req.query.action === 'listimage') {
      var dir_url = imgDir;
      res.ue_list(dir_url); // 客户端会列出 dir_url 目录下的所有图片
  }
  // 客户端发起其它请求
  else {
      // console.log('config.json')
      res.setHeader('Content-Type', 'application/json');
      res.redirect('/ueditor/nodejs/config.json');
  }
}));

app.use('/font', indexRouter);
app.use('/admin', adminRouter);
app.use("/wangUeditor", wangEditor);


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
