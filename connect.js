const mongoose = require('mongoose');
const connectDB = ()=>{
mongoose.connect(process.env.MONGO_URI)
.then((res)=>console.log('MongoDB connect!'))
.catch((error)=>console.log(error,'MongoDB failed'))
}
module.exports = connectDB;
// module.exports = dbReport;
