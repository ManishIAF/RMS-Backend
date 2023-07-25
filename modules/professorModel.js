import mongoose from 'mongoose';

const professorSchema = new mongoose.Schema({
    profile:String,
    firstName: String,
    lastName:String,
    email: String,
    coursesId: [{ type: mongoose.Schema.Types.ObjectId, ref: 'course' }],
    department: String,
    userInfoId:{ type: mongoose.Schema.Types.ObjectId, ref: 'UserInfo' }
  });

  const professor = mongoose.model('professor',professorSchema);

export default professor;