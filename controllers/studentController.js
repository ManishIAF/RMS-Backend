import student from '../modules/studentModel.js'
import professor from '../modules/professorModel.js';
import userInfoModule from '../modules/userInfo.module.js';
import results from '../modules/resultModel.js'
// import userModule from '../modules/user.module.js';

const allStudentGet = async(req,res)=>{

    const {semester}=req.query;

    const {email} = req.user;

    const query = {};

    if (semester) {
      
        query.Semester=semester;
        
    } 
    

    professor.findOne({email:email}).populate("coursesId").exec((error,profData)=>{
    
        if(error) return res.status(500).send('server error');
    
        if(!profData) return res.status(401).send('not authorised');

        if(profData){

          const coursesToMatch = profData?.coursesId;

          student.aggregate([
              
              {$match:query?.Semester?{"Semester":Number(query?.Semester)}:{}},
              {$match:{department:profData?.department}},
                {
                    $lookup: {
                      from: "results",
                      localField: "ResultId",
                      foreignField: "_id",
                      as: "results"
                    }
                  },
                  {
                    $lookup: {
                      from: "courses",
                      localField: "results.courseId",
                      foreignField: "_id",
                      as: "courses"
                    }
                  },

                  {
                    $project: {
                      _id: 1,
                      profile:1,
                      firstName: 1,
                      lastName: 1,
                      department: 1,
                      email: 1,
                      Semester: 1,
                      Roll_Number: 1,
                      Regitration_Number: 1,
                      courses:1,
                    }
                  },

              ], function(err, students) {

                if (err) {

                  console.log(err);

                } else {

                  const updatedData = students.map((student) => {

                    const filteredCourse = coursesToMatch?.find(courseToMatch => student?.Semester === courseToMatch?.Semester)
                    

                    if(!filteredCourse){

                      return {...student,status:false};

                    }if(filteredCourse){

                      if(student?.courses?.length === 0){

                        return {...student,status:false};
 
                      }
                      
                      if(student?.courses?.length >= 1){


                        const check = student?.courses?.find(course=>course?.subject === filteredCourse?.subject)
                        
                        if(check){
                        
                          return {...student,status:true}
                         
                        }else if(!check){


                          return {...student,status:false}

                        }
                      }
                    }
                  })

                  res.status(200).json(updatedData); 

                }

              });

        }
    })
    

}

const studentResult = async(req,res)=>{
  try {
    const {email,role,_id} = req.user;
    const query = {}
    const {id,semester} = req.query;

    if(id){
      query.studentId = id
    }

    if(role === 'professor' || 'HOD'){

      professor.findOne({email:email},async(error,profData)=>{

        if(error) return res.status(500).send('server error');
    
        if(!profData) return res.status(401).send('not authorised');

        if(profData){
            
            query.department = profData?.department;
            const data = await results.find(query).populate('courseId')
            
            const Data = [];
            let Agregate = 0
            for(let studentResult of data){
              
              const {_id,Internal,Theory,Practical,Total,courseId:{subject,code:SubjectCode,Semester}} = studentResult;
              
              if(Number(semester) === Semester){
              
                let Percentage = (Total/80)*100;
                Agregate = Agregate+Total;
                Data.push({_id,subject,SubjectCode,Internal,Theory,Practical,Total,Percentage,status:(Percentage >= 40)?'Pass':'Fail'});

              } 
            }
            res.status(200).json({Data,Agregate,AgregatePercentage:(Agregate/(80*Data.length))*100});
    
        }
      })

    }

    if(role === 'student'){

      const data = await results.find({_id:_id}).populate('courseId')
      
      const Data = data.map((studentResult)=>{
        let returnedValue = {}
        const {_id,Internal,Theory,Practical,Total,courseId:{subject,code:SubjectCode,Semester}} = studentResult;
        if(Number(semester) === Semester){

          returnedValue = {_id,subject,SubjectCode,Semester,Internal,Theory,Practical,Total};

        }
        return returnedValue;
      })
      res.status(200).json(Data);

    }

    
  } catch (error) {
    
    res.status(500).send('server error')

  }


}

const singleStudentGet = async(req,res)=>{

  try {
console.log('student called');
    const {email,role,_id} = req.user;
    const query = {}
    const {rollNumber}=req.params;
    const {id} = req.query;

    if(rollNumber){

      query.Roll_Number = Number(rollNumber);

    }

    if(id){
      query._id = id
    }

    if(role === 'professor' || 'HOD'){

      professor.findOne({email:email},async(error,profData)=>{

        if(error) return res.status(500).send('server error');
    
        if(!profData) return res.status(401).send('not authorised');

        if(profData){
            
            query.department = profData?.department;
            const data = await student.findOne(query);
            res.status(200).json(data);
    
        }
      })

    }

    if(role === 'student'){

      const data = await student.findOne({_id:_id})
      res.status(200).json(data);

    }

    
  } catch (error) {
    
    res.status(500).send('server error')

  }
    

}

const studentPost = async(req,res)=>{

  try {

    console.log('you are in');

    if(req?.user?.role === 'HOD'){

      const profData = await professor.findOne({email:req?.user?.email})

      const {Profile,firstName,lastName,Semester,Roll_Number,Regitration_Number,email:studentEmail} = req.body;

      student.findOne({email:studentEmail},(error,studentData)=>{

        if(error) res.status(500).send('server error');

        if(studentData?.email) return res.status(409).send('student already exist');

        if(!studentData?.email){

          const newStudent =new student({
            profile:Profile,
            firstName:firstName,
            lastName:lastName,
            department:profData?.department,
            email:studentEmail,
            Roll_Number:Roll_Number,
            Regitration_Number:Regitration_Number
          });

          newStudent.save((err)=>{
            if(err){

                console.log(err);

            }else{

                res.send('data saved')
            }
        
          });
        }

      })

    }else{
      res.status(401).send('not authorised')
    }

  } catch (error) {
    
    console.log('error : ',error);

  }
        
    
        

}

const studentDelete = async(req,res)=>{

  const {email,role} = req.user;

  const {id} = req.query;
  
  console.log("info : ",id,email,role);
  
  if(role != 'HOD') return res.status(401).send('you are not authorised')

  if(role === 'HOD'){

    student.findOne({_id:id},(error,foundStudent)=>{

      if(error){
        return res.status(500).send('server error')
      }
  
      if(!foundStudent) return res.status(404).send('student non found')
  
      if(foundStudent){

        professor.findOne({email:email},async(error,authorisedUser)=>{

          if(error) return res.status(500).send('server error');
    
          if(!error){
    
            if(authorisedUser?.department != foundStudent?.department){
              return res.status(401).send('you are not authorised')
            }

            if(authorisedUser?.department === foundStudent?.department){
             
              await userInfoModule.deleteOne({_id:foundStudent?.userInfoId})
              await results.deleteMany({_id:{$in:foundStudent?.ResultId}})
              await student.deleteOne({_id:id})
              // await userModule.deleteOne({email:foundStudent?.email})
  
              return res.status(200).send('student Deleted');

            }
    
          }
    
        })
  
      }
      
    })

  }

}

// const studentPatch = async(req,res)=>{

//     const { error } = validateProduct(req.body); 
//     if (error) return res.status(400).send(error.details[0].message);
  
//     const Student = await student.findById(req.params.id).exec();
//     if (!Student) return res.status(404).send('The product with the given ID was not found.');
  
//     let query = {$set: {}};
//     for (let key in req.body) {
//       if (Student[key] && Student[key] !== req.body[key]) // if the field we have in req.body exists, we're gonna update it
//          query.$set[key] = req.body[key];
  
//     const updatedtudent = await student.updateOne({_id: req.params.id}, query).exec();
  
//     res.send(Student);
    

// }
// }

export {singleStudentGet,studentResult,allStudentGet,studentPost,studentDelete};