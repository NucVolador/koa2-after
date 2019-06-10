const router = require('koa-router')()
const Job = require("../dbs/models/job");
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
					// let obj_promise = new Promise(async (res,rej)=>{
					// 	let result_temp = await temp_a.map(async (item,index)=>{
					// 		// console.log(item,"这是职位")
					// 		let AdminCompany_result = await AdminCompanyInfo
					// 			.find({ownerId:item.ownerId})
					// 			.select('address companyName email introduce phoneNum special avatar')
					// 			// .then(AdminCompany_result =>{
					// 			// 	item.company = AdminCompany_result[0]
					// 			// 	// console.log(item,"这是item")
					// 			// 	// console.log(AdminCompany_result[0],"这是职位");
					// 			// })
					// 		// console.log(AdminCompany_result,"AdminCompany_result")
					// 		item.company = AdminCompany_result[0]
					// 		return item;
					// 	})
					// 	// console.log(result_temp,"result_temp");
					// 	res(result_temp)
					// })
					// ctx.body = {
					// 	msg: "aa"
					// }
					//  await obj_promise.then(async data =>{
					// 	 await setTimeout(()=>{
					// 	 	console.log(data,"data")
					//
					// 	 },300);
					//
					//  })
					// console.log(result_temp);
					
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

router.get('/bar', function (ctx, next) {
	ctx.body = 'this is a users/bar response'
})

module.exports = router
