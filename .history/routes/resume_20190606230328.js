const router = require('koa-router')();


router.post('/avatar',async (ctx) => {
    // console.log()
    console.log(ctx.request.files);
    console.log(ctx.request.body);
    ctx.body = JSON.stringify(ctx.request.files);
    
});

module.exports = router