function pv(ctx){
    global.console.log(ctx.path)
}

module.exports = function(){
    return async function (){
        pv(ctx);
        await next();
    }
}