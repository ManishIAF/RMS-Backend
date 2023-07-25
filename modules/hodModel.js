import mongoose from 'mongoose';


const hodSchema = new mongoose.Schema({
    name: String,
    email: String,
    department: String,
    studentsId: [{ type: mongoose.Schema.Types.ObjectId, ref: 'student' }],
    professorsId: [{ type: mongoose.Schema.Types.ObjectId, ref: 'professor' }]
  });


  const HOD = mongoose.model('hod',hodSchema);

  export default HOD;