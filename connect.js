const mongoose = require('mongoose');
// let dbReport = 'test';
const connectDB = async ()=>  {
  try {
    mongoose.set("strictQuery", true);
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Database Connected Successfully");
    // dbReport = "Database Connected Successfully";
  } catch (error) {
    console.log("DAtabase error");
    // dbReport = "Database Connection Failed";
  }
};

// const getDbReport = () => dbReport;

// module.exports = {
//   connectDB,
//   getDbReport,
// }

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
// module.exports = dbReport;
