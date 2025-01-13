const mongoose = require('mongoose');
const EmployeeSchema = mongoose.Schema({
    username: String,
    email: String,
    password: String
})
const EmployeeModel = mongoose.model("users", EmployeeSchema)
module.exports = EmployeeModel
