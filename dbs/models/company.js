const mongoose = require('mongoose');

let adminCompanyInfoSchema = new mongoose.Schema({
	address: String,
	companyName: String,
	email: String,
	introduce: String,
	phoneNum: String,
	special: String,
	avatar: String,
	ownerId: String
})

module.exports = mongoose.model('AdminCompanyInfo',adminCompanyInfoSchema)