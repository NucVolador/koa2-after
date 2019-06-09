const router = require('koa-router')()
const AdminCompanyInfo = require("../dbs/models/company");
const Job = require("../dbs/models/job");
const fs = require('fs')
const syspath = require('path')
const mongo = require('mongodb')

const BSON = require('bson')

router.prefix('/admin')

router.get('/companyInfo', async (ctx, next) => {
	const {userId} = ctx.request.query;
	let companyFields= {
		companyName: {
			value: ""
		},
		email: {
			value: ""
		},
		phoneNum: {
			value: ""
		},
		address: {
			value: ""
		},
		introduce: {
			value: ""
		},
		special: {
			value: ""
		},
		avatar: {
			value: ""
		}
	}
	let code,msg,data;
	try {
		await AdminCompanyInfo.find({ownerId: userId})
			.then(async AdminCompany_result=>{
				if(AdminCompany_result.length > 0){
					companyFields= {
						companyName: {
							value: AdminCompany_result[0].companyName
						},
						email: {
							value: AdminCompany_result[0].email
						},
						phoneNum: {
							value: AdminCompany_result[0].phoneNum
						},
						address: {
							value: AdminCompany_result[0].address
						},
						introduce: {
							value: AdminCompany_result[0].introduce
						},
						special: {
							value: AdminCompany_result[0].special
						},
						avatar: {
							value: AdminCompany_result[0].avatar
						}
					}
					code = 1;
					msg = "公司信息获取成功"
					data = {
						companyFields
					}
			}else{
				data = null;
				msg = "暂无公司信息";
				code = 1
			}
		})
	}catch (e) {
	
	}
	ctx.body = {
		code,
		msg,
		data
	}
})

router.post('/companyAvatar', async (ctx, next) => {
	const {path} = ctx.request.files.avatar;
	const {userId} = ctx.request.body;
	//用户ID
	let data,msg,code;
	try {
		let AdminCompanyInfo_result = await AdminCompanyInfo.find({ownerId: userId});
		if(AdminCompanyInfo_result.length > 0){
			// 公司存在，直接更新
			let update_result = await AdminCompanyInfo
				.where({_id: AdminCompanyInfo_result[0]['_id']})
				.update({ $set: { avatar: "\\" + path}})
			if(update_result.n){
				code = 1;
				msg = "Logo上传成功";
				data = {
					avatar: "\\" + path
				}
				fs.unlink(syspath.join(__dirname,"..\\"+AdminCompanyInfo_result[0].avatar),(err)=>{
					if(err){
						console.log(err,"删除失败");
					}else{
						console.log("删除成功");
					}
				});
			}else{
				code = -1;
				msg = "Logo上传失败"
				data = AdminCompanyInfo_result[0]
			}
		}else{
			// 简历不存在，需新建
			const adminCompanyInfoInstance = new AdminCompanyInfo({
				avatar: "\\" + path,
				ownerId:userId
			})
			let AdminCompanyInfo_save_result = await adminCompanyInfoInstance.save();
			global.console.log(AdminCompanyInfo_save_result,"新增简历！");
			code = 1,
				msg = "上传成功",
				data = {
					avatar:"\\" + path
				}
		}
		
	}catch (e) {
		console.log(e,"错误")
		ctx.body = e
	}
	ctx.body = {
		code,
		data,
		msg
	}
})

router.post('/companyInfo', async (ctx, next) => {
	const req = ctx.request.body;
	const {
		address,
		companyName,
		email,
		introduce,
		phoneNum,
		special,
		userId
	} = req;
	let data,msg,code;
	console.log(ctx.request.body)
	try {
		await AdminCompanyInfo
			.find({ownerId: userId})
			.then(async company_result=>{
				if(company_result.length > 0) {
					await AdminCompanyInfo
						.where({_id: company_result[0]._id})
						.update({ $set: {
								address: address.value,
								companyName: companyName.value,
								email: email.value,
								introduce: introduce.value,
								phoneNum: phoneNum.value,
								special: special.value,
								ownerId: userId
							}})
						.then(update_result=>{
							if(update_result.n){
								code = 1;
								msg = "公司信息更新成功";
								data = {}
							}else{
								code = -1;
								msg = "公司信息更新失败"
								data = {}
							}
						})
				}else{
					await AdminCompanyInfo.create({
						address: address.value,
						companyName: companyName.value,
						email: email.value,
						introduce: introduce.value,
						phoneNum: phoneNum.value,
						special: special.value,
						ownerId: userId
					})
						.then((instance)=>{
							if(instance){
								code = 1;
								msg = "公司信息上传成功";
								data = instance
							}else{
								code = -1;
								msg = "公司信息上传失败"
								data = instance
							}
						})
				}
			})
	}catch (e) {
		console.log(e);
	}
	ctx.body = {
		code,
		msg,
		data
	}
})

router.get("/job", async (ctx)=>{
	let req = ctx.request.query
	let {
		userId,
		page
	} = req;
	let code,msg,result;
	page = page?Number(page):1
	let item_list = [];
	let page_size = 10;
	let total_count = 0;
	try {
		await Job
			.find({ownerId: userId})
			.then(async job_result=>{
				total_count = job_result.length;
			})
		await Job
			.find({ownerId: userId})
			.skip(page_size* (page-1))
			.limit(page_size)
			.sort({ timestamp: -1 })
			.then(async job_result=>{
				if(job_result.length > 0){
					item_list= job_result
					code = 1;
					msg = "职位信息获取成功";
					result = {
						item_list,
						page,
						page_size,
						total_count
					}
				}else{
					result = {
						item_list,
						page,
						page_size,
						total_count
					};
					msg = "职位信息暂无";
					code = 1
				}
			})
	}catch (e) {
		console.log(e);
	}
	ctx.body = {
		code,
		msg,
		result
	}
});

router.post("/job", async (ctx)=>{
	let req = ctx.request.body
	let {
		userId,
		jobId,
		jobDescription,
		jobName
	} = req;
	let code,msg,data
	data = { a: BSON.ObjectID};
	if(jobId === ""){
		jobId = "51111111148bc53918c73ba3"
		// jobId = "5cfc81aa948bc53918c73ba3"
		
	}
	try {
		await Job
			.find({_id: new BSON.ObjectID(jobId)})
			.then(async job_result=>{
				if(job_result.length > 0) {
					await Job
						.where({_id: job_result[0]._id})
						.update({ $set: {
								jobDescription,
								jobName,
								ownerId: userId,
								timestamp: new Date().getTime()
							}})
						.then(update_result=>{
							if(update_result.n){
								code = 1;
								msg = "职位信息更新成功";
								data = {}
							}else{
								code = -1;
								msg = "职位信息更新失败"
								data = {}
							}
						})
				}else{
					await Job.create({
						jobDescription,
						jobName,
						ownerId: userId,
						timestamp: new Date().getTime()
					})
						.then((instance)=>{
							if(instance){
								code = 1;
								msg = "增加职位信息成功";
								data = instance
							}else{
								code = -1;
								msg = "增加职位信息失败"
								data = instance
							}
						})
				}
			})
	}catch (e) {
		console.log(e);
	}
	ctx.body = {
		code,
		msg,
		data
	}
});

router.get('/deleteJob', async (ctx)=>{
	const {jobId} = ctx.request.query;
	let data,msg,code;
	try {
		await Job
			.remove({_id:new BSON.ObjectID(jobId)})
			.then(delete_result=>{
				console.log(delete_result);
				if(delete_result.n){
					code = 1;
					msg = "刪除职位信息成功";
					data = {}
				}else{
					code = -1;
					msg = "删除职位信息失败"
					data = {}
				}
			})
	}catch (e) {
		console.log(e);
	}
	ctx.body = {
		code,
		data,
		msg
	}
})

module.exports = router
