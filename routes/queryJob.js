const router = require('koa-router')()
const Job = require("../dbs/models/job");
const ApplyList = require("../dbs/models/applyList");
const AdminCompanyInfo = require("../dbs/models/company");


router.get('/queryJob', async (ctx, next) =>{
	let req = ctx.request.query;
	let {
		keyword,
		page
	} = req;
	let msg,code,result;
	page = page?Number(page):1;
	keyword = keyword?keyword:".";
	let item_list = [];
	let page_size = 10;
	let total_count = 0;
	const reg = new RegExp(keyword, 'i')
	try {
		await Job
			.find({
				$or : [ //多条件，数组
					{jobName : {$regex : reg}},
					{jobDescription : {$regex : reg}}
				]
			})
			.sort({ timestamp: -1 })
			.then(async job_result=>{
				total_count = job_result.length;
			})
		await Job
			.find({
				$or : [ //多条件，数组
					{jobName : {$regex : reg}},
					{jobDescription : {$regex : reg}}
				]
			})
			.skip(page_size* (page-1))
			.limit(page_size)
			.sort({ timestamp: -1 })
			.then(async job_result=>{
				if(job_result.length > 0){
					let arr = [];
					let temp_a = JSON.parse(JSON.stringify(job_result))
					await Promise.all(temp_a.map((item,index)=>{
						let AdminCompany_result = AdminCompanyInfo
							.find({ownerId:item.ownerId})
							.select('address companyName email introduce phoneNum special avatar')
						return AdminCompany_result
					}))
						.then(data=>{
							console.log(data);
							let array_a = temp_a.map((item,index)=> {
								item.company = data[index][0]
								return item
							})
							return array_a
						})
						.then((data)=>{
							item_list= data
							// console.log(data);
							code = 1;
							msg = "职位信息获取成功";
							result = {
								item_list,
								page,
								page_size,
								total_count
							}
							ctx.body={
								code,
								msg,
								result
							}
						})
				}else{
					result = {
						item_list,
						page,
						page_size,
						total_count
					};
					msg = "职位信息暂无";
					code = 1
					ctx.body={
						code,
						msg,
						result
					}
				}
			})
	}catch (e) {
		console.log(e);
	}
	
	
})

router.get('/queryState', async (ctx, next) =>{
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
			.find({candidateId: userId})
			.then(async ApplyList_result=>{
				total_count = ApplyList_result.length;
			})
		await ApplyList
			.find({
				candidateId: userId,
			})
			.skip(page_size* (page-1))
			.limit(page_size)
			.sort({ timestamp: -1 })
			.then(async ApplyList_result=>{
				if(ApplyList_result.length > 0){
					item_list= ApplyList_result;
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

module.exports = router
