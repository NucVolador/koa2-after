const multiparty = require("multiparty");
const router = require('koa-router')();


router.post('/avatar',async (ctx) => {
    let errsign={status:500,exception:null};
    let datasign={status:200,recordset:null};
    function loadimg() {
        let send_json={};
        return  new Promise((resolve,reject)=>{
            let form = new multiparty.Form({uploadDir:'./images/' });
            form.parse(ctx.req,function(err,fields,files){
                if(err){
                    // throw err;
                    console.log(err);//Error: write after end
                    send_json={
                        exception:"解析失败",
                        err:false
                    };
                    resolve(send_json);
                    // return send_json;
                }else{
                    // console.log(fields);//除文件外的其他附带信息
                    // console.log("files = ",files);//文件信息
                    if(files!==undefined&&files!=={}&&files.file!==undefined){
                        // console.log(files.file);
                        if(files.file.length>0){
                            let filename = files.file[0].path;
                            let filetype = files.file[0].headers['content-type'];
                            let realname = files.file[0].originalFilename;
                            // console.log("filename = ",filename);
                            // console.log("filetype = ",filetype);
                            // console.log("realname = ",realname);
                            if(filetype.indexOf("image/")>=0){
                                send_json={
                                    recordset:"上传成功",
                                    err:true
                                };
                                resolve(send_json);
                            }else{
                                send_json={
                                    exception:"上传失败",
                                    err:false
                                };
                                fs.unlinkSync(filename);//删除非图片文件
                                resolve(send_json);
                            }
                        }
                    }else{
                        send_json={
                            exception:"未上传文件",
                            err:false
                        };
                        resolve(send_json);
                    }
                }
            });
        });
    }
    await loadimg().then(r=>{
        // console.log("r = ",r);
        if(r.err===false){
            errsign["exception"]=r.exception;
            ctx.body=errsign;
        }else{
            datasign["recordset"]=r.recordset;
            ctx.body=datasign;
        }
    });
});