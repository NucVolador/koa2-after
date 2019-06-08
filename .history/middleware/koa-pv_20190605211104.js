function pv(ctx){
    global.console.log("aaaaaaaaaaaa",ctx.path)
}

module.exports = function(){
    return async function (ctx,next){
        pv(ctx);
        await next();
    }
}