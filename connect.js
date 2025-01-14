const mongoose = require('mongoose');
const connectDB = ()=>  {
  try {
    mongoose.set("strictQuery", true);
    const conn = mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Database Connected Successfully");
    return "Database Connected Successfully"
  } catch (error) {
    console.log("DAtabase error");
    return "Database Connection Failed"
  }
};
//   {
// mongoose.connect(process.env.MONGO_URI)
// .then((res)=>{
//   console.log(res,'MongoDB connect!');
//   return 'Connected Mongo'
// })
// .catch((error)=>{
//   console.log(error,'MongoDB failed');
//   return 'Not connected Mongo'
// })
// }
module.exports = connectDB;
