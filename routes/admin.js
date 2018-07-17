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
// uuid
var uuid = require('node-uuid');
// 文件上传中间件
var formidable = require('formidable');
var fs = require("fs");


//这里传入了一个密钥加session id
router.use(cookieParser(config.s_id.admin));
//使用就靠这个中间件
router.use(session({ secret: config.s_id.admin, proxy: true, resave: false, saveUninitialized: false}));

// 后台数据库连接池
const db = mysql.createPool(config.database.admin);


// 验证token的合法性
router.use(expressJwt ({
  secret:  config.secret_token.admin 
}).unless({
  path: ['/admin/login', '/admin/getToken', '/admin/index', '/admin/captcha']  //除了这些地址，其他的URL都需要验证
}));

// 拦截器
router.use(function(err, req, res, next) {
  // 当token验证失败时会抛出如下错误
  if(err.name === 'UnauthorizedError') {
    // 返回401
    res.status(401).json({code: 1, message: '无效的token'})
  }
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
    color: true ,   // 是否设置背景色
    background: '#fff'
  });
  req.session.CAPTCHA_KEY = cap.text.toLowerCase();
  res.type('svg');
  res.send(cap.data);
})

/*
*   后台管理登录接口
*   @params  
*   username  账号
*   password  密码
*   capkey  图形验证码
*/
router.post('/login', function( req, res) {
  console.log(req.session.CAPTCHA_KEY)
    const {
      username,
      capkey
    } = req.body;
    const password = config.md5(req.body.password + config.MD5_SUFFIX);

    if(capkey.toLowerCase() !== req.session.CAPTCHA_KEY) {
      // 图形验证码输入不正确
      res.json({
        code: 1,
        message: '验证码输入错误'
      })
    }else {
      // 验证码输入正确， 进行数据库查询
      db.query(`SELECT username, password FROM t_sys_user WHERE username='${username}'`, (error, data) => {
        if(error) {
          console.error(error);
				  res.status(500).send('database error').end();
        }else {
          if (data.length === 0) {
            // 没有查询到此用户
            res.json({
              code: 1,
              message: '登录失败，用户名错误'
            })
          } else {
            if (data[0].password !== password) {
              // 密码错误，登录失败
              console.log(password)
              res.json({
                code: 1,
                message: '登录失败，密码错误',
                password: data[0].password
              })
            } else {
              //登录成功  生成token
              // 生成 token
              const token = jwt.sign( {userid: data.userid, name: data.username }, config.secret_token.admin, {
                expiresIn:  60*60*24 //秒到期时间
              });
              res.json({
                code: 0,
                message: `登录成功，欢迎${data[0].username}登录Jason的博客后台管理系统`,
                token: token,
                username: data[0].username,
              })
            }
          }
        }
      })
    }
})


/*
*   后台管理 文章发布接口
*   @params  
*   title      文章标题
*   author     文章作者
*   content    文章内容
*/
router.post('/articlePublish', function( req, res) {
  let {
    title,
    author,
    content
  } = req.body;
  if(!title) {
    res.json({
      code: 1,
      message: '标题不能为空！'
    })
  }else if(!author) {
    res.json({
      code: 1,
      message: '作者不能为空！'
    })
  }else if (!content) {
    res.json({
      code: 1,
      message: '文章内容不能为空！'
    })
  }else {
    const artUUID = uuid.v1();
    db.query(`INSERT INTO t_sys_articlelist (artlist_uuid, artlist_title, artlist_author) VALUES ('${artUUID}','${title}', '${author}')`, function(err) {
      if(err) {
        console.log(err);
        res.json({
          code: 1,
          message: '服务器繁忙，请稍后再试！'
        })
      }else {
        db.query(`INSERT INTO t_sys_articles ( artlist_uuid, articles_content, articles_create_time, articles_update_time) VALUES ('${artUUID}', '${content}', NOW(), NOW())`, function(err) {
          if(err) {
            console.log(err);
            res.json({
              code: 1,
              message: '服务器繁忙，请稍后再试！'
            })
          }else {
            res.json({
              code: 0,
              message: '入库成功！'
            })
          }
        })
      }
    })
  }
})

/*
*   后台管理 查询文章列表接口
*   @params  
*   title      文章标题
*   author     文章作者
*/
router.post('/articleList', function(req, res) {
  db.query(`SELECT * FROM t_sys_articlelist`, function(err, data) {
    if(err) {
      console.log(err);
      res.json({
        code: 1,
        message: '服务器繁忙，请稍后再试！'
      })
    }else {
      res.json({
        code: 0,
        message: '查询成功！',
        data: data
      })
    }
  })
})

/*
*   后台管理图片上传功能
* 
*/
router.post('/walnut/imgUpload', function(req, res) {
  const form = new formidable.IncomingForm();
  // 上传文件的保存路径
  form.uploadDir = config.uploadDir.admin;
  // 是否保存扩展名
  form.keepExtensions = true;
  // 上传文件的最大大小
  form.maxFileSize = 20 * 1024 * 1024;
  form.parse(req, function(err, fields, files){
    if(err) {
      throw err;
    }
    console.log('1==>', fields);
    console.log('2==>', files.file.name)
    const name = files.file.name;
    const path = files.file.path;
    console.log(name, path)
    // const title = fields.title;
    // const singer = fields.singer;
    // const music = path.basename(files.music.path);
    // const img = path.basename(files.img.path);
    // db.path(`INSERT INTO t_sys_walnuts (title, singer, music, img) VALUES ()`)
    res.json({
      code: 0,
      message: '上传成功'
    })
  })
})

/* GET users listing. */
router.post('/index', function(req, res) {
  console.log(req.cookies)
  console.log(req.session)
  console.log(req.user)
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
