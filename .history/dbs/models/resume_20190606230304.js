const mongoose = require('mongoose');

let resumeSchema = new mongoose.Schema({
    username: String,
    password: String,
    type: String
})

module.exports = {
    
}


// }mongoose.model('User',userSchema)