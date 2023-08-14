import result from "../modules/resultModel.js";
import student from '../modules/studentModel.js';
import professor from '../modules/professorModel.js';
import course from '../modules/courseModel.js';

const resultAllGet = async(req,res)=>{

    const {semester} = req.query;
    const {email} = req.user;

    professor.findOne({email:email},(error,profData)=>{

        if(error){
            return res.status(500).send('server error');
        }
        
        if(!profData?.coursesId){
            res.status(200).send([])
        }

        if(profData?.coursesId){

            result.aggregate([
                {
                  $match: { courseId:{$in:profData?.coursesId} }
                },
                {
                  $lookup: {
                    from: 'students',
                    localField: 'studentId',
                    foreignField: '_id',
                    as: 'student'
                  }
                 
                },
                {
                  $unwind: '$student'
                },
                {
                    $lookup: {
                        from: 'courses',
                        localField: 'courseId',
                        foreignField: '_id',
                        as: 'course'
                      }
                },
                
                {
                    $unwind: '$course'
                },

                {
                    $match:semester ? {'course.Semester':Number(semester)} : {}
                },

                {
                  $group: {
                    _id: '$_id',
                    studentInfoId: { $first: '$student._id' },
                    profile: { $first: '$student.profile' },
                    firstName: { $first: '$student.firstName' },
                    lastName: { $first: '$student.lastName' },
                    Roll_Number: { $first: '$student.Roll_Number' },
                    Regitration_Number: { $first: '$student.Regitration_Number' },
                    Semester:{ $first: '$course.Semester' },
                    subject: { $first: '$course.subject' },
                    Internal: { $first: '$Internal' },
                    Theory: { $first: '$Theory' },
                    Practical: { $first: '$Practical' },
                    Total: { $sum: '$Total' },
                  },

                },

              ]).exec((error, results) => {
                
                if(error) return res.status(500).send('server error');
              
                if(results){
                    res.status(200).send(results);
                }
            
            });

        }

    })

}

const resultSingleGet = async(req,res)=>{


    const {id}=req.params;

    const {email} = req.user;

    professor.findOne({email:email},(error,{coursesId})=>{

        if(error){
            return res.status(500).send('server error');
        }
        if(!coursesId){
            res.status(404).send('no subject alloted to you')
        }

        if(coursesId){
            result.findOne({_id:id,courseId:{$in:coursesId}})
            .populate("studentId").populate("courseId")
            .exec((error,result)=>{

                const {_id,studentId:{profile,firstName,lastName,Roll_Number,Regitration_Number,Semester:currentSemester},courseId:{subject,Semester:subjectSemester},Internal,Theory,Practical,Total} = result;

                const resultData = {_id,profile,firstName,lastName,currentSemester,subjectSemester,Roll_Number,Regitration_Number,subject,Internal,Theory,Practical,Total};
                
                res.status(200).send(resultData);

            })
        }

    })

}


const resultPost = async(req,res)=>{

    const {email} = req.user;

    const {Roll_Number,SubjectId,Internal,Theory,Practical} = req.body;
console.log('SubjectId : ',SubjectId)
    professor.findOne({email:email},(error,profData)=>{

        if(error){
            res.status(500).send('server error');
        }
        if(!profData){

            res.status(401).send('not authorised')
            
        }
        if(profData){
            
            course.findOne({_id:SubjectId,department:profData?.department},(error,courseData)=>{

                if(error){
                
                    res.status(500).send('server error');
                
                }

                if(courseData?.professorId.toString() != profData?._id.toString()){
                
                    res.status(401).send('course not authorised');
                
                }else if(courseData?.professorId.toString() === profData?._id.toString()){

                    student.findOne({Roll_Number:Roll_Number,department:profData.department},(error,studentData)=>{

                        if(error){
                            res.status(500).send('server error');
                        }

                        if(!studentData){
                            res.status(404).send('no student of this roll no exists');
                        }else if(studentData){


                            if(courseData?.Semester > studentData?.Semester){
                                res.status(403).send('can not add course whose semester is greater')
                            }
                            if(courseData?.Semester <= studentData?.Semester){
                                result.findOne({ studentId: studentData._id, courseId: courseData._id }, (error, resultData) => {
                                    // console.log('resultData : ',resultData);
                                    if (error) {
                                        res.status(500).send('server error');
                                    }

                                    if (resultData) {
                                        res.status(403).send('result already exists');
                                    }
                                    if (!resultData) {

                                        const newResult = new result({

                                            studentId: studentData._id,
                                            courseId: courseData._id,
                                            Internal: Internal,
                                            Theory: Theory,
                                            Practical: Practical,
                                            Total: (() => {

                                                return Internal + Theory + Practical;

                                            })()

                                        })

                                        newResult.save((err) => {

                                            if (err) {

                                                console.log(err);

                                            }
                                            else {

                                                student.updateOne({ Roll_Number: Roll_Number }, { $push: { "ResultId": newResult._id } }, { new: true }, (err, updatedData) => {

                                                    if (!err) {

                                                        res.status(200).send('result stored...');

                                                    }

                                                })

                                            }

                                        });



                                    }

                                })

                            }
                           

                        }

                    })

                }
                

            })

        }

    })

//************************************************************** */

// console.log('profData : ',profData);


//     if(profData?.coursesId.length === 0 || profData === null){
    
//         return res.status(401).send('Not Autherrised...')

//     }else if(profData?.coursesId[0].semester != Number(Semester)){
// //mohinishaw356xJ@RMy

//         return res.status(401).send('wrong semester')
    
//     }else if(profData.coursesId != null){
        
//                 student.findOne({Roll_Number:Roll_Number,department:profData.department},(error,studentData)=>{

//                     if(error){
    
//                         res.status(500).send('server error');

//                     } 
                    
//                     if(!studentData){

//                         res.status(404).send('no tsudent of this roll number exist');
            
//                     }

//                     if(studentData){

//                         result.findOne({studentId:studentData._id})
//                         .populate({path:"courseId",match:{subject:Subject}})
//                         .exec((error,resultAvailable)=>{

//                             if (error) {
//                                 return res.status(500).send('server error');
//                             }

//                             if (resultAvailable?.courseId != null) {
                                
//                                 return res.status(403).send('result already exist')
//                             }

//                             if(resultAvailable?.courseId === null || resultAvailable === null ){

//                                 const newResult = new result({

//                                     studentId:studentData._id,
//                                     courseId:profData.coursesId[0]._id,
//                                     Internal:Internal,
//                                     Theory:Theory,
//                                     Practical:Practical,
//                                     Total:(()=>{
                                                    
//                                             return Internal + Theory + Practical;
                                                    
//                                         })()
                                         
//                                 })
                                                    
//                                 newResult.save((err)=>{
                                                    
//                                     if(err){
                                                    
//                                         console.log(err);
                                    
//                                     }
//                                     else{

//                                         student.updateOne({Roll_Number:Roll_Number},{$push: {"ResultId": newResult._id}},{new:true},(err,updatedData)=>{
//                                             if(!err){

//                                                 res.status(200).send('result stored...');
                                
//                                             }
                                
//                                         })
                                                    
//                                     }
                                                    
//                                 });

//                             }

//                         })


                        
                        

//                     }
                    
//                 })


//     }

//********************************************************************* */
    
}


const resultUpdate = async(req,res)=>{

    try {

        const {email} = req.user;

        const {id} = req.params;

        const {Internal,Theory,Practical} = req.body;

        const DataToBeUpdated = {
            Internal,
            Theory,
            Practical,
            Total:(()=>{

                return Internal+Theory+Practical

            })(),

        }

        professor.findOne({email:email},(error,profData)=>{
            
            if(error) return res.status(500).send('server error');

            if(!profData) return res.status(401).send('not authorised')

            if(profData){

                result.updateOne({_id:id},DataToBeUpdated,(err,updatedData)=>{

                    if(err) return res.status(500).send('server error')

                    if(!err){
        
                        if(updatedData){
    
                            res.status(200).send('result updated successfully');

                        }
        
                    }
        
                })

                
            }

        })
        
        

    } catch (error) {
        console.log(error);
    }


}

const resultdelete = async(req,res)=>{

    try {

        const {id:resultId} = req.params;
        console.log('ResultId : ',req.params)
      
        result.findOneAndDelete({ _id: resultId }, (err, deletedResult) => {
            if (err) {
                // handle error
                res.status(500).send('server error')
            } else if (!deletedResult) {
            // handle case where result with specified ID was not found
                res.status(404).send('result not found')
            } else {
                // remove the result ID from the corresponding student
                student.findOneAndUpdate(
                    { _id: deletedResult?.studentId },
                    { $pull: { ResultId: deletedResult?._id } },
                    { new: true },
            
                    (err, updatedStudent) => {
                
                        if (err) {
                        // handle error
                        } else if(updatedStudent) {
                            res.status(200).send('data deleted')
                        }
                    }
                );
            }
        });
            

    } catch (error) {
        
        console.log(error);
    
    }


}



export {resultAllGet,resultSingleGet,resultPost,resultUpdate,resultdelete};