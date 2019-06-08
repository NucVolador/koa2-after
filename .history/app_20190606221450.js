const Koa = require('koa')
const app = new Koa()
const views = require('koa-views')
const json = require('koa-json')
const onerror = require('koa-onerror')
const bodyparser = require('koa-bodyparser')
const logger = require('koa-logger')
const mongoose = require('mongoose');
const dbConfig = require('./dbs/config');

const koaBody = require('koa-body');
// const static = require("koa-static");


const index = require('./routes/index')
const users = require('./routes/users')
const login = require('./routes/login')
const resume = require('./routes/resume')

// error handler
onerror(app)

// middlewares
app.use(bodyparser({
  enableTypes:['json', 'form', 'text']
}))
app.use(koaBody({
  multipart: true,  
  formidable: {
    maxFileSize: 200*1024*1024,    // 设置上传文件大小最大限制，默认2M
    uploadDir:path.join(__dirname,'./upload/images/'), // 设置文件上传目录
    keepExtensions: true,    // 保持文件的后缀
    // maxFieldsSize:2 * 1024 * 1024, // 文件上传大小
    onFileBegin:(name,file) => { // 文件上传前的设置
      // console.log(`name: ${name}`);
      // console.log(file);
  }
}));
app.use(json())
app.use(logger())
app.use(require('koa-static')(__dirname + '/public'))

app.use(views(__dirname + '/views', {
  extension: 'ejs'
}))

// logger
app.use(async (ctx, next) => {
  const start = new Date()
  await next()
  const ms = new Date() - start
  console.log(`${ctx.method} ${ctx.url} - ${ms}ms`)
})

// routes
app.use(index.routes(), index.allowedMethods())
app.use(users.routes(), users.allowedMethods())
app.use(login.routes(), login.allowedMethods())
app.use(resume.routes(), resume.allowedMethods())

// app.use(static(__dirname+"/static"));

mongoose.connect(dbConfig.dbs,{
  useNewUrlParser:true
})



// error-handling
app.on('error', (err, ctx) => {
  console.error('server error', err, ctx)
});

module.exports = app
