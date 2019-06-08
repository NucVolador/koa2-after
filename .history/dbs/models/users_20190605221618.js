const mongoose = require('mongoose');

let userSchema = new mongoose.Schema({
    username: String,
    password: String,
    type: String
})
