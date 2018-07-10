/*
*      配置项：  cookie session token 的签名 盐    
*               数据库配置
*               md5 配置  使用crypto
*/
const crypto = require('crypto');

module.exports = {
    MD5_SUFFIX: 'sdfadfDFADFADFA_121$&^%&*!啊瞬间法律的类似阿里斯顿sdlfalsfasdfa',
    md5: function(str) {
        const obj = crypto.createHash('md5');
        obj.update(str);
        return obj.digest('hex');
    },
    // JWT 签名的 盐
    secret_token:{
        admin: 'Jason_bolg_admin_token_salt',
        font: 'Jason_bolg_font_token_salt'
    },
    // cookie 和 session 的盐：
    s_id: {
        admin: 'Jason_bolg_admin',
        font: 'Json_bolg_font'
    },
    // 数据库的地址
    database: {
        admin: {
            host: '47.95.223.216',
            port: '3306',
            user: 'root',
            password: 'SHEN396689144@',
            database: 'jason_blog'
        },
        font: ''
    }
}



