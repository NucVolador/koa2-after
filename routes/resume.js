const router = require('koa-router')();
const Resume = require("../dbs/models/resume");
const fs = require('fs');
const syspath = require('path')

const {EduModel,CompanyModel,ProjectModel,ResumeModel} = Resume;


router.post('/avatar',async (ctx) => {
    const {path} = ctx.request.files.avatar;
	const {userId} = ctx.request.body;
	//用户ID
 	let data,msg,code;
	global.console.log(userId)
    try {
		let resume_result = await ResumeModel.find({ownerId: userId});
		console.log(resume_result,"查询结果");
		if(resume_result.length > 0){
		    // 简历存在，直接更新
			global.console.log(resume_result,"有简历！");
			let update_result = await ResumeModel
				.where({_id: resume_result[0]['_id']})
                .update({ $set: { avatar: "\\" + path}})
			if(update_result.n){
				code = 1;
				msg = "头像上传成功";
				data = {
					avatar: "\\" + path
				}
				fs.unlink(syspath.join(__dirname,"..\\"+resume_result[0].avatar),(err)=>{
					if(err){
						console.log(err,"删除失败");
					}else{
						console.log("删除成功");
					}
				});
			}else{
				code = -1;
				msg = "更新失败"
				data = resume_result[0]
			}
		}else{
			// 简历不存在，需新建
			const resumeInstance = new ResumeModel({
				avatar: "\\" + path,
				ownerId:userId
			})
			let resume_save_result = await resumeInstance.save();
			global.console.log(resume_save_result,"新增简历！");
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
});

router.post('/personInfo',async (ctx)=>{
	const req = ctx.request.body;
	const {
		userId,
		username,
		sex,
		email,
		phoneNum,
		age,
		educationMax,
		introduce,
	} = req;
	let data,msg,code;
	try {
		let resume_result = await ResumeModel.find({ownerId: userId});
		if(resume_result.length > 0){
			// 简历存在
			let update_result = await ResumeModel
				.where({_id: resume_result[0]['_id']})
				.update({ $set: {
					username: username.value,
					sex: sex.value,
					email:email.value,
					phoneNum: phoneNum.value,
					age: age.value,
					educationMax:educationMax.value,
					introduce:introduce.value,
				}})
			if(update_result.n){
				code = 1;
				msg = "个人信息更新成功";
				data = {}
			}else{
				code = -1;
				msg = "个人信息更新失败"
				data = {}
			}
		}else{
			// 简历不存在
			
			const resumeInstance = new ResumeModel({
				username: username.value,
				sex: sex.value,
				email:email.value,
				phoneNum: phoneNum.value,
				age: age.value,
				educationMax:educationMax.value,
				introduce:introduce.value,
				ownerId:userId
			})
			let resume_save_result = await resumeInstance.save();
			global.console.log(resume_save_result,"新增简历！");
			code = 1;
			msg = "个人信息上传成功";
			data = {}
		}
	}catch (e) {
		console.log(e);
	}
	ctx.body = {
		code,
		msg,
		data
	}
});

router.post('/eduInfo',async (ctx)=>{
	const req = ctx.request.body;
	const {
		userId,
		college,
		eduTime,
		educationInfo,
		major,
	} = req;
	let data,msg,code;
	try {
		await ResumeModel
			.find({ownerId: userId})
			.then(async resume_result=>{
				if(resume_result.length > 0){
					await ResumeModel
						.where({_id: resume_result[0]['_id']})
						.then(async edu_result=>{
							// 想改成多段教育经历需要传每段经历的_id
							if(edu_result[0].eduList.length > 0){
								await EduModel
									.where({_id: company_result[0].eduList[0]})
									.update({ $set: {
											college: college.value,
											eduTime: eduTime.value,
											educationInfo: educationInfo.value,
											major: major.value
										}})
									.then(update_result=>{
										if(update_result.n){
											code = 1;
											msg = "教育信息更新成功";
											data = {}
										}else{
											code = -1;
											msg = "教育信息更新失败"
											data = {}
										}
									})
							}else{
								await EduModel.create({
									college: college.value,
									eduTime: eduTime.value,
									educationInfo: educationInfo.value,
									major: major.value
								})
									.then(instance => {
										return ResumeModel
											.where({_id: resume_result[0]['_id']})
											.update({$set:{
													eduList: [instance._id]
												}})
									})
									.then((update_result)=>{
										if(update_result.n){
											code = 1;
											msg = "教育信息上传成功";
											data = {
											}
										}else{
											code = -1;
											msg = "教育信息上传失败"
											data = {}
										}
									})
							}
						})
				}else{
					await EduModel.create({
						college: college.value,
						eduTime: eduTime.value,
						educationInfo: educationInfo.value,
						major: major.value
					})
						.then(instance=>{
							const resumeInstance = new ResumeModel({
								eduList: [instance._id],
								ownerId:userId
							})
							return resumeInstance.save();
						})
						.then(result=>{
							if(result.eduList.length > 0){
								code = 1;
								msg = "教育信息上传成功";
								data = result
							}else{
								code = -1;
								msg = "教育信息上传失败";
								data = {}
							}
						})
						.catch(err=>{
							console.log(err);
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

router.post('/companyInfo',async (ctx)=>{
	const req = ctx.request.body;
	const {
		userId,
		company,
		jobName,
		workDescription,
		workTime,
	} = req;
	let data,msg,code;
	try {
		await ResumeModel
			.find({ownerId: userId})
			.then(async resume_result=>{
				if(resume_result.length > 0){
					await ResumeModel
						.where({_id: resume_result[0]['_id']})
						.then(async company_result=>{
							// 想改成多段教育经历需要传每段经历的_id
							if(company_result[0].companyList.length > 0){
								await CompanyModel
									.where({_id: company_result[0].companyList[0]})
									.update({ $set: {
											company: company.value,
											jobName: jobName.value,
											workDescription: workDescription.value,
											workTime: workTime.value
										}})
									.then(update_result=>{
										if(update_result.n){
											code = 1;
											msg = "工作经验更新成功";
											data = {}
										}else{
											code = -1;
											msg = "工作经验更新失败"
											data = {}
										}
									})
							}else{
								await CompanyModel.create({
									company: company.value,
									jobName: jobName.value,
									workDescription: workDescription.value,
									workTime: workTime.value
								})
									.then(instance => {
										return ResumeModel
											.where({_id: resume_result[0]['_id']})
											.update({$set:{
													companyList: [instance._id]
												}})
									})
									.then((update_result)=>{
										if(update_result.n){
											code = 1;
											msg = "工作经验上传成功";
											data = {
											}
										}else{
											code = -1;
											msg = "工作经验上传失败"
											data = {}
										}
									})
							}
						})
				}else{
					await CompanyModel.create({
						company: company.value,
						jobName: jobName.value,
						workDescription: workDescription.value,
						workTime: workTime.value
					})
						.then(instance=>{
							const resumeInstance = new ResumeModel({
								companyList: [instance._id],
								ownerId:userId
							})
							return resumeInstance.save();
						})
						.then(result=>{
							if(result.companyList.length > 0){
								code = 1;
								msg = "工作经验上传成功";
								data = result
							}else{
								code = -1;
								msg = "工作经验上传失败";
								data = {}
							}
						})
						.catch(err=>{
							console.log(err);
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

router.post('/projectInfo',async (ctx)=>{
	const req = ctx.request.body;
	const {
		userId,
		project,
		projectDescription,
		projectTime,
		roleName,
	} = req;
	let data,msg,code;
	try {
		await ResumeModel
			.find({ownerId: userId})
			.then(async resume_result=>{
				if(resume_result.length > 0){
					await ResumeModel
						.where({_id: resume_result[0]['_id']})
						.then(async project_result=>{
							// 想改成多段教育经历需要传每段经历的_id
							if(project_result[0].projectList.length > 0){
								await ProjectModel
									.where({_id: project_result[0].projectList[0]})
									.update({ $set: {
											project: project.value,
											projectDescription: projectDescription.value,
											projectTime: projectTime.value,
											roleName: roleName.value
										}})
									.then(update_result=>{
										if(update_result.n){
											code = 1;
											msg = "项目经验更新成功";
											data = {}
										}else{
											code = -1;
											msg = "项目经验更新失败"
											data = {}
										}
									})
							}else{
								await ProjectModel.create({
									project: project.value,
									projectTime: projectTime.value,
									projectDescription: projectDescription.value,
									roleName: roleName.value
								})
									.then(instance => {
										return ResumeModel
											.where({_id: resume_result[0]['_id']})
											.update({$set:{
												projectList: [instance._id]
											}})
									})
									.then((update_result)=>{
										if(update_result.n){
											code = 1;
											msg = "项目经验上传成功";
											data = {
											}
										}else{
											code = -1;
											msg = "项目经验上传失败"
											data = {}
										}
									})
							}
						})
				}else{
					await ProjectModel.create({
						project: project.value,
						projectTime: projectTime.value,
						projectDescription: projectDescription.value,
						roleName: roleName.value
					})
						.then(instance=>{
							const resumeInstance = new ResumeModel({
								projectList: [instance._id],
								ownerId:userId
							})
							return resumeInstance.save();
						})
						.then(result=>{
							if(result.projectList.length > 0){
								code = 1;
								msg = "项目经验上传成功";
								data = result
							}else{
								code = -1;
								msg = "项目经验上传失败";
								data = {}
							}
						})
						.catch(err=>{
							console.log(err);
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

router.get('/resume', async (ctx)=>{
	const {userId} = ctx.request.query;
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
	let data,msg,code;
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
					code = 1;
					msg = "简历获取成功"
						data = {
						personFields,
						eduFields,
						workFields,
						projectFields
					}
				}else{
					data = null;
					msg = "暂无简历";
					code = 1
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



module.exports = router