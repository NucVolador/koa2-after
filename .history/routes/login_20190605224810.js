const router = require('koa-router')();
const User = require('../dbs/models/users');

router.post('/login', async function (ctx, next){
    const req = ctx.request.body;
    global.console.log(req);
    const user = new User({
        username: req.username,
        password: req.password,
        type: req.type
    })
    let code ;
    try {
        let value = await User.findOne({
            username: req.username,
            password: req.password,
            type: req.type
        });
        global.console.log(value[0]," 这里打印")
        debugger
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