import mongoose from "mongoose";

const studentScema = new mongoose.Schema({

    profile:String,
    firstName:String,
    lastName:String,
    department:String,
    email:String,
    Semester:{type:Number,default:1},
    Roll_Number:Number,
    Regitration_Number:Number,
    ResultId:[{ type: mongoose.Schema.Types.ObjectId, ref: 'result' }],
    userInfoId:{ type: mongoose.Schema.Types.ObjectId, ref: 'UserInfo' },
    isCourseSemesterMatched: Boolean

});

const student= mongoose.model("student",studentScema);

export default student;