const router = require('koa-router')();

router.post('/login', async function (ctx, next){
    const req = ctx.request.body;
    global.console.log(req);
    ctx.body = {
        code: 1
    }
})

module.exports = router