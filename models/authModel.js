const mongoose = require('mongoose');
const authSchema = mongoose.Schema({

})


const authModel = mongoose.model("authUsers",authSchema);
module.exports = authModel
