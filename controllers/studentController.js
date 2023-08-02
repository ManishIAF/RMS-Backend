import student from '../modules/studentModel.js'
import professor from '../modules/professorModel.js';
import userInfoModule from '../modules/userInfo.module.js';
import results from '../modules/resultModel.js'
import userModule from '../modules/user.module.js';
import { hash } from 'bcrypt';
import otpGenerator from 'otp-generator'
import handleMail from '../middleware/handleMail.js';

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
    const {email,role,_id} = req.user;
    const query = {}
    const {rollNumber}=req.params;
    // const {id} = req.query;
    if(rollNumber){

      query.Roll_Number = Number(rollNumber);

    }

    // if(id){
    //   query._id = id
    // }

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
// xyz2580fpw3#K
  try {

    const {email,role} = req.user;

    if(role === 'HOD'){

      const {Profile,firstName,lastName,Roll_Number,Registration_Number,email:studentEmail} = req.body;

      let passpart = otpGenerator.generate(6,{lowerCaseAlphabets:true,upperCaseAlphabets:true,specialChars:true})
      const username = await studentEmail.split("@")[0]

      let regex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).+$/;

      while (!regex.test(passpart)) {
        passpart = otpGenerator.generate(6, { upperCase: true, specialChars: true, digits: true, alphabets: true });
      }

      const autogeneratedPassword = username + `${passpart}`

      console.log('autogeneratedPassword : ',autogeneratedPassword);

      const text = `welcome to WBSU Mr./Ms. ${firstName + lastName} 
            Your username is ${username} and temporary password is ${autogeneratedPassword}.
            please change your password as soon as possible.`;

      userModule.findOne({email:studentEmail},(error,studentData)=>{

        if(error) res.status(500).send('server error');

        if(studentData?.email) return res.status(409).send('student already exist');

        if(!studentData?.email){
          hash(autogeneratedPassword,10).then( async(hashedPassword) =>{

            const newUser = new userModule({
              username,
              password : hashedPassword,
              email : studentEmail,
            })

            const profData = await professor.findOne({email:email})

            newUser.save().then(savedUserData => {


              if(savedUserData){


                const newStudent =new student({
                  profile:Profile,
                  firstName:firstName,
                  lastName:lastName,
                  department:profData?.department,
                  email:studentEmail,
                  Roll_Number:Roll_Number,
                  Regitration_Number:Registration_Number
                });

                newStudent.save().then(async(savedProfessorData) => {
                
                  if(savedProfessorData){
            
                    await handleMail({firstName,studentEmail,subject:"Professor Authentication",text})
            
                    res.status(200).send("student added");
        
                  }
                })
              }
            
            })
          })
        }

      })

    }else{
      res.status(401).send('not authorised')
    }

  } catch (error) {
    
    res.status(401).send('not authorised')

  }
        
}

const studentDelete = async(req,res)=>{

  const {email,role} = req.user;

  const {id} = req.query;
  
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
              await userModule.deleteOne({email:foundStudent?.email})
  
              return res.status(200).send('student Deleted');

            }
    
          }
    
        })
  
      }
      
    })

  }

}

const studentPatch = async(req,res)=>{

    try {
  
      const {role,email} = req.user;
      
      if(req?.user?.role === 'HOD'){

        const profData = await professor.findOne({email:email})
  
        const {id,Profile,firstName,lastName,Roll_Number,Regitration_Number,email:studentEmail} = req.body;
  
        student.findOne({email:studentEmail},(error,studentData)=>{
  
          if(error) res.status(500).send('server error');
  
          if(studentData?.department != profData?.department) return res.status(401).send('you are not authorised');
  
          if(studentData?.department === profData?.department){
  
            const dataToUpdate = {
              profile:Profile,
              firstName:firstName,
              lastName:lastName,
              department:profData?.department,
              email:studentEmail,
              Roll_Number:Roll_Number,
              Regitration_Number:Regitration_Number
            }
  
            student.updateOne({_id:id},dataToUpdate,(error,updatedStudent)=>{
              if(error) return res.status(500).send('server error');
              
              if(!updatedStudent) return res.status(501).send('oops something bad happen');

              if(updatedStudent) return res.status(200).send('student updated successfully');

            })
           
          }
  
        })
  
      }else{
        res.status(401).send('not authorised')
      }      
    } catch (error) {
      
    }

}

export {singleStudentGet,studentResult,allStudentGet,studentPost,studentDelete,studentPatch};