const mongoose = require('mongoose');

let applyListSchema = new mongoose.Schema({
	resumeInfo: String,
	jobName: String,
	jobId: String,
	candidateId: String,
	candidateName: String,
	createJobId: String,
	state: String,
	timestamp: String
})

module.exports = mongoose.model('ApplyList',applyListSchema)