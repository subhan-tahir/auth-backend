const mongoose = require('mongoose');
const connectDB = ()=>{
mongoose.connect(process.env.MONGO_URI)
.then((res)=>{
  console.log(res,'MongoDB connect!');
  return 'Connected Mongo'
})
.catch((error)=>{
  console.log(error,'MongoDB failed');
  return 'Not connected Mongo'
})
}
module.exports = connectDB;
