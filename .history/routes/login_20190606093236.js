const router = require('koa-router')();
const User = require('../dbs/models/users');

router.post('/login', async function (ctx, next){
    const req = ctx.request.body;
    // const user = new User({
    //     username: req.username,
    //     password: req.password,
    //     type: req.type
    // })
    let code,data,msg ;
    try {
        let value = await User.findOne({
            username: req.username,
            password: req.password
            // type: req.type
        });
        if(value !== null){
            code = 1;
            
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
        code: 1
    }
})

router.post('/register', async function (ctx, next){
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
    let code,msg ;
    try {
        await user.save();
        code = 0;
        msg = "注册成功"
    } catch (error) {
        code = -1
        msg = "注册失败"+ error;
        global.console.log(error)
    }
    ctx.body = {
        code: code,
        msg: msg
    }
})

module.exports = router