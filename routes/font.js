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


// 后台数据库连接池
const db = mysql.createPool(config.database.admin);

router.get('/index', function(req, res) {
  res.json('欢迎欢迎')
})


/*
*   前台 获取资讯列表
*   @params    
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
      let resMsg = [];
      for(let i = 0 ; i < data.length; i++) {
        let msg = {}
        msg.author = data[i].artlist_author;
        msg.id = data[i].artlist_id;
        msg.recommend = data[i].artlist_recommend;
        msg.title = data[i].artlist_title;
        resMsg.push(msg);
      }
      res.json({
        code: 0,
        message: '查询成功！',
        data: resMsg
      })
    }
  })
})

/*
*   前台 获取文章详情
*   @params  
*   id      文章id
*/
router.post('/article', function(req, res) {
  const id = req.body.id;
  if(!id){
    res.json({
      code: 1,
      message: 'id不能为空！'
    })
  }
  db.query(`SELECT artlist_id, artlist_title, artlist_author, artlist_recommend, articles_content, articles_update_time FROM t_sys_articlelist AS a LEFT JOIN t_sys_articles AS b ON a.artlist_uuid=b.artlist_uuid WHERE artlist_id='${id}'`, function(err, data) {
    if(err) {
      console.log(err);
      res.json({
        code: 1,
        message: '服务器繁忙，请稍后再试！'
      })
    }else {
      let resMsg = {};
      for(let key in data[0]) {
        resMsg[key.split('_')[1]] = data[0][key];
      }
      res.json({
        code: 0,
        message: '查询成功！',
        data: resMsg
      })
    }
  })
});

module.exports = router;
