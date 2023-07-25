import mongoose from "mongoose";
// import student from "./studentModel.js";
const resultScema = new mongoose.Schema({

    studentId:{ type: mongoose.Schema.Types.ObjectId, ref: 'student' },
    courseId:{ type: mongoose.Schema.Types.ObjectId, ref: 'course' },
    Internal:Number,
    Theory:Number,
    Practical:Number,
    Total:Number,
    
});


// resultScema.pre('remove', function(next) {
//     this.model('student').deleteOne(
//       { _id: this.studentId },
//       { $pull: { ResultId: this._id } },
//       { new: true },
//       function(err, updatedStudent) {
//         if (err) return next(err);
//         next();
//       }
//     );
//   });


const result= mongoose.model("result",resultScema);

export default result;