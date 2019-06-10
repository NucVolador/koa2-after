const mongoose = require('mongoose');

let jobSchema = new mongoose.Schema({
	jobName: String,
	jobDescription: String,
	ownerId: String,
	timestamp: Number,
})

module.exports = mongoose.model('Job',jobSchema)