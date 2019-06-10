const router = require('koa-router')()
const AdminCompanyInfo = require("../dbs/models/company");
const Job = require("../dbs/models/job");
const ApplyList = require("../dbs/models/applyList");
const Resume = require("../dbs/models/resume");

const {EduModel,CompanyModel,ProjectModel,ResumeModel} = Resume;


const fs = require('fs')
const syspath = require('path')

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
			// let a = new Job({
			// 	Company: adminCompanyInfoInstance.avatar,
			// 	owner
			// })
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
});

// 投递功能
router.post("/applyList", async (ctx)=>{
	let req = ctx.request.body
	let {
		userId,
		jobId,
		jobName,
		createJobId
	} = req;
	let personFields= {
		username: {
			value: ""
		},
		sex	: {
			value: ""
		},
		email: {
			value: ""
		},
		phoneNum: {
			value: ""
		},
		age: {
			value: ""
		},
		educationMax: {
			value: ""
		},
		introduce: {
			value: ""
		},
		avatar: {
			value: ""
		}
	}
	let eduFields = {
		college: {
			value: ""
		},
		eduTime: {
			value: ""
		},
		educationInfo: {
			value: ""
		},
		major: {
			value: ""
		}
	}
	let workFields= {
		company: {
			value: ""
		},
		workTime: {
			value: ""
		},
		jobName: {
			value: ""
		},
		workDescription: {
			value: ""
		}
	}
	let projectFields= {
		project: {
			value: ""
		},
		projectTime: {
			value: ""
		},
		roleName: {
			value: ""
		},
		projectDescription: {
			value: ""
		}
	}
	let code,msg,data
	try {
		await ResumeModel.find({ownerId: userId})
			.then(async resume_result=>{
				if(resume_result.length > 0){
					personFields= {
						username: {
							value: resume_result[0].username
						},
						sex	: {
							value: resume_result[0].sex
						},
						email: {
							value: resume_result[0].email
						},
						phoneNum: {
							value: resume_result[0].phoneNum
						},
						age: {
							value: resume_result[0].age
						},
						educationMax: {
							value: resume_result[0].educationMax
						},
						introduce: {
							value: resume_result[0].introduce
						},
						avatar: {
							value: resume_result[0].avatar
						}
					}
					if(resume_result[0].eduList.length>0){
						await EduModel
							.where({_id: resume_result[0].eduList[0]})
							.then((instance=>{
								eduFields = {
									college: {
										value: instance[0].college
									},
									eduTime: {
										value: instance[0].eduTime
									},
									educationInfo: {
										value: instance[0].educationInfo
									},
									major: {
										value: instance[0].major
									}
								}
							}))
					}
					if(resume_result[0].companyList.length>0){
						await CompanyModel
							.where({_id: resume_result[0].companyList[0]})
							.then((instance=>{
								workFields = {
									company: {
										value: instance[0].company
									},
									workTime: {
										value: instance[0].workTime
									},
									jobName: {
										value: instance[0].jobName
									},
									workDescription: {
										value: instance[0].workDescription
									}
								}
							}))
					}
					if(resume_result[0].projectList.length>0){
						await ProjectModel
							.where({_id: resume_result[0].projectList[0]})
							.then((instance=>{
								projectFields = {
									project: {
										value: instance[0].project
									},
									projectTime: {
										value: instance[0].projectTime
									},
									roleName: {
										value: instance[0].roleName
									},
									projectDescription: {
										value: instance[0].projectDescription
									}
								}
							}))
					}
					let resumeInfo = {
						personFields,
						eduFields,
						workFields,
						projectFields
					}
					let candidateName = resume_result[0].username;
					// 若已投递则无法重复投递
					await ApplyList
						.find({
							candidateId:userId,
							jobId
						})
						.then( async (apply_result)=>{
							if(apply_result.length > 0){
								code = 1;
								msg = "此职位已投递";
								data = {}
							}else{
								await ApplyList
									.create({
										resumeInfo: JSON.stringify(resumeInfo),
										jobName,
										jobId,
										candidateId: userId,
										candidateName,
										createJobId,
										state: "0",
										timestamp: new Date().getTime()
										//	state : 0 已投递，1 面邀 ，2 通过 ，3 人才库
									})
									.then(instance=>{
										if(instance){
											code = 1;
											msg = "投递成功！";
											data = instance;
										}else{
											code = 1;
											msg = "投递失败！";
											data = instance;
										}
									})
							}
						})
					
					
				}else{
					data = null;
					msg = "请先创建简历";
					code = 1
				}
			})
	}catch (e) {
		console.log(e);
	}
	ctx.body={
		code,
		msg,
		data
	}
})

//企业筛选
router.get("/applyList", async (ctx)=>{
	let req = ctx.request.query;
	let {
		userId,
		page
	} = req;
	let msg,code,result;
	page = page?Number(page):1;
	let item_list = [];
	let page_size = 10;
	let total_count = 0;
	try {
		await ApplyList
			.find({createJobId: userId})
			.then(async ApplyList_result=>{
				total_count = ApplyList_result.length;
			})
		await ApplyList
			.find({
				createJobId: userId,
				state:{ $in: ['0','1','2']}
			})
			.skip(page_size* (page-1))
			.limit(page_size)
			.sort({ timestamp: -1 })
			.then(async ApplyList_result=>{
				if(ApplyList_result.length > 0){
					item_list= ApplyList_result
					code = 1;
					msg = "投递信息获取成功";
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
					msg = "投递信息暂无";
					code = 1
				}
			})
	}catch (e) {
		console.log(e);
	}
	
	ctx.body={
		msg,
		code,
		result
	}
})

router.post("/updateApplyList", async (ctx) => {
	let req = ctx.request.body
	let {
		jobId,
		candidateId,
		state
	} = req;
	let code,msg,data
	try {
		await ApplyList
			.where({
				jobId,
				candidateId,
			})
			.update({
				$set:{
					state
				}
			})
			.then(instance=>{
				if(instance.n){
					code = 1;
					msg = "投递状态更新成功";
					data = {}
				}else{
					code = -1;
					msg = "投递状态更新失败"
					data = {}
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

// 人才库
router.get("/talentPool", async (ctx) => {
	let req = ctx.request.query;
	let {
		userId,
		page
	} = req;
	let msg,code,result;
	page = page?Number(page):1;
	let item_list = [];
	let page_size = 10;
	let total_count = 0;
	try {
		await ApplyList
			.find({createJobId: userId})
			.then(async ApplyList_result => {
				total_count = ApplyList_result.length;
			})
		await ApplyList
			.find({
				createJobId: userId,
				state: {$in: ['3']}
			})
			.skip(page_size * (page - 1))
			.limit(page_size)
			.sort({timestamp: -1})
			.then(async ApplyList_result => {
				if (ApplyList_result.length > 0) {
					item_list = ApplyList_result
					code = 1;
					msg = "投递信息获取成功";
					result = {
						item_list,
						page,
						page_size,
						total_count
					}
				} else {
					result = {
						item_list,
						page,
						page_size,
						total_count
					};
					msg = "投递信息暂无";
					code = 1
				}
			})
	}catch(e){
		console.log(e);
	}
	ctx.body={
		msg,
		code,
		result
	}
})

module.exports = router
