function pv(ctx){
    global.console.log(ctx.path)
}

module.exports = function(){
    return async function (ctx,next){
        pv(ctx);
        await next();
    }
}