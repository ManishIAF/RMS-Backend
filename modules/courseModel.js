import mongoose from 'mongoose';


const courseSchema = new mongoose.Schema({
    name: String,
    department: String,
    Semester: Number,
    subject:String,
    code: String,
    professorId: { type: mongoose.Schema.Types.ObjectId, ref: 'professor' }
  });

  const course = mongoose.model('course',courseSchema);

  export default course;