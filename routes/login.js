const router = require('koa-router')();
const User = require('../dbs/models/users');

router.post('/login', async function (ctx, next){
    const req = ctx.request.body;
    // const user = new User({
    //     username: req.username,
    //     password: req.password,
    //     type: req.type
    // })
    // global.console.log(ctx.request.body," 头像")
    let code,data,msg ;
    try {
        let value = await User.findOne({
            username: req.username,
            password: req.password
            // type: req.type
        });
        if(value !== null){
            code = 1;
            msg = "登录成功"
        }else{
            code = -1;
            msg = "用户名或密码错误"
        }
        data = value;
        // for(var i in value){
        //     if(Object.hasOwnProperty(i)){
        //         continue
        //     }
        //     global.console.log(i," 这里打印")
        // }
        global.console.log(value," 这里打印")
    } catch (error) {
        
    }
    ctx.body = {
        code,
        data,
        msg
    }
})

router.post('/register', async function (ctx, next){
    global.console.log("register");
    const {
        username,
        password,
        type
    } = ctx.request.body;
    const user = new User({
        username,
        password,
        type
    })
    let code,msg,data ;
    try {
        let validate = await User.find({
            username,
            password,
            type
        });
        if(validate.length > 0){
            code = -1;
            msg = "注册失败，用户已存在"
            data = null
        }else{
            let value = await user.save();

            code = 1;
            msg = "注册成功"
            data = value
        }
    } catch (error) {
        code = -1
        msg = "注册失败"+ error;
        global.console.log(error)
    }
    ctx.body = {
        code: code,
        msg: msg,
        data: data
    }
})

module.exports = router