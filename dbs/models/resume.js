const mongoose = require('mongoose');

let eduSchema = new mongoose.Schema({
	college: String,
	eduTime: Array,
	educationInfo: String,
	major: String,
})

let companySchema = new mongoose.Schema({
	company: String,
	workTime: Array,
	jobName: String,
	workDescription: String,
});

let projectSchema = new mongoose.Schema({
	project: String,
	projectTime: Array,
	roleName: String,
	projectDescription: String,
});

let resumeSchema = new mongoose.Schema({
	username: String,
    sex: String,
    email: String,
    phoneNum: String,
	age: String,
	educationMax: String,
	introduce: String,
	avatar: String,
	is_complete: Boolean,
	ownerId: String,
    // eduList:[eduSchema],
	// companyList: [companySchema],
    // projectList: [projectSchema]
	eduList: Array,
	companyList: Array,
	projectList: Array
})



module.exports = {
	EduModel: mongoose.model('EduInfo', eduSchema),
	CompanyModel: mongoose.model('CompanyInfo', companySchema),
	ProjectModel: mongoose.model('ProjectInfo', projectSchema),
	ResumeModel: mongoose.model('ResumeInfo', resumeSchema)
}


// }mongoose.model('User',userSchema)