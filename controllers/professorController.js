import UserModel from '../modules/user.module.js';
import userInfoModule from '../modules/userInfo.module.js';
// import student from '../modules/studentModel.js';
import { hash } from 'bcrypt';
import otpGenerator from 'otp-generator'
import handleMail from '../middleware/handleMail.js';
import professor from '../modules/professorModel.js';
import course from "../modules/courseModel.js"
import userModule from '../modules/user.module.js';

const allProfessorGet = (req,res)=>{

    try {

        const {email,role} = req.user;
        
        if(role === 'HOD'){
            professor.findOne({email:email},(error,profData)=>{
        
                if(error) return res.status(500).snd('server error');

                if(!error){
        
                    if(!profData) return res.status(401).send('not authorised');
        
                    if(profData){
        
                        if(profData?.department){
        
                            professor.find({department:profData?.department}).populate({path:'coursesId'}).exec((error,professorsUnderHOD)=>{
        
                                if(error) return res.status(500).send('server error');
        
                                if(!error){
        
                                    if(professorsUnderHOD){
                                        res.status(200).send(professorsUnderHOD);
        
                                    }
        
                                }
        
                            })
        
                        }
        
                    }
        
                }
        
            })
        
        }
        
    } catch (error) {
        
        res.status(500).send('server error')

    }

}

const professorById = async(req,res)=>{

    try {
    
        const {role,email} = req.user;

        const {id} = req.params;

        if(role != 'HOD') return res.status(401).send('you are not authorised')

        if(role === 'HOD'){

            const authorisedProfessor = await professor.findOne({email})

            if(!authorisedProfessor) return res.status(401).send('you are not authorised');

            if(authorisedProfessor){
                const profData = await professor.findOne({_id:id})
                if(!profData) return res.status(404).send('professor not found');
                if(profData){
                    if (authorisedProfessor?.department === profData?.department) {
                        
                        res.status(200).send(profData);

                    }
                }
            }

        }
        
    } catch (error) {
        res.status(401).send('you are not authorised')
    }
    
}

const profCourses = async(req,res)=>{

    try {

        const { email} = req.user;
        const {profId} = req.params;
        let query = {}
        if(profId){

            query = {_id:profId};

        }else{

           query = {email:email}

        }

        professor.findOne(query,(error,profData)=>{

            if(error) return res.status(500).send('server error');
        
            if(!profData) return res.status(401).send('not authorised');

            if(profData){

                 course.find({_id:{$in:profData?.coursesId}},(error,courseData)=>{
                    if(error) return res.status(500).send('server error');
        
                    if(!courseData) return res.status(403).send('no course authorised');

                    if(courseData?.length) return res.status(200).send(courseData);
                    
                })

            }

        })

    } catch (error) {
        
        res.status(500).send('server error');

    }
    
    

}

const professorPost = async(req,res)=>{

    try {

        const {email:Email,role} = req.user
        
        if(role === 'HOD'){

            const {firstName,lastName,Gender,DOB,email} = req.body;
            let passpart = otpGenerator.generate(6,{lowerCaseAlphabets:true,upperCaseAlphabets:true,specialChars:true})
            const username = await email.split("@")[0]

            let regex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).+$/;

            while (!regex.test(passpart)) {
                passpart = otpGenerator.generate(6, { upperCase: true, specialChars: true, digits: true, alphabets: true });
            }

            const autogeneratedPassword = username + `${passpart}`

            console.log('autogeneratedPassword : ',autogeneratedPassword);

            const text = `welcome to WBSU Mr./Ms. ${firstName + lastName} 
                  Your username is ${username} and temporary password is ${autogeneratedPassword}.
                  please change your password as soon as possible.`;
    
            UserModel.findOne({email:email},(error,userData)=>{
    
                if(error) return res.status(500).send('server error');
        
                if(userData?.email === email) return res.status(409).send('Professor already exist');
        
                if(userData?.email != email){
           
                    hash(autogeneratedPassword,10).then( async(hashedPassword) =>{
            
                        const newUser = new UserModel({
                            username,
                            password : hashedPassword,
                            email : email,
                            role:'professor'
                        })

                        const {department} = await professor.findOne({email:Email})


                        newUser.save().then(savedUserData => {


                            if(savedUserData){

                                const newProfessor = new professor({
                                    firstName,
                                    lastName,
                                    Gender,
                                    DOB:new Date(DOB),
                                    email,
                                    department,
                                })

                                newProfessor.save().then(async(savedProfessorData) => {
                        
                                if(savedProfessorData){
                            
                                    await handleMail({firstName,email,subject:"Professor Authentication",text})
                            
                                    res.status(200).send("professor added");
                        
                                }
                            })

                        }

                    })


                })
            }
        })


        }else{
    
            return res.status(401).send('unauthorised')
    
        }

    } catch (error) {
        
        return res.status(501).send('something bad happen')
    
    }
    
}

const professorDelete = async(req,res)=>{

  const {email,role} = req.user;
  const {id} = req.query;
  
  if(role != 'HOD'){

    return res.status(401).send('you are not authorised')

  }
  if(role === 'HOD'){

    professor.findOne({_id:id},(error,foundProfessor)=>{
        if(error) return res.status(500).send('server error');
    
        if(!foundProfessor) return res.status(404).send('professor non found')
    
        if(foundProfessor){
        
          professor.findOne({email:email},async(error,authorisedUser)=>{

            if(error) res.status(500).send('server error')

            if(!error){

                if(authorisedUser?.department != foundProfessor.department){
                    return res.status(401).send('you are not authorised')
                }

                if(authorisedUser?.department === foundProfessor.department){

                    await userInfoModule.deleteOne({_id:foundProfessor?.userInfoId})
                    await course.updateMany({professorId:foundProfessor?._id},{ $unset: { professorId:''} })
                    await professor.deleteOne({_id:foundProfessor?._id})
                    await UserModel.deleteOne({email:foundProfessor?.email})
              
                    return res.status(200).send('Professor Deleted sucessfully...');

                }

            }

          })
    
        }
        
      })

  }

}

const professorUpdate = async(req,res)=>{
    try {
    
        const {role,email} = req.user;

        const {id,firstName,lastName,Gender,DOB,email:userEmail} = req.body
        
        if(role != 'HOD') return res.status(401).send('you are not authorised')

        if(role === 'HOD'){

            const authorisedProfessor = await professor.findOne({email})

            if(!authorisedProfessor) return res.status(401).send('you are not authorised');

            if(authorisedProfessor){
                
                const profData = await professor.findOne({_id:id})

                if(!profData) return res.status(404).send('professor not found');
                
                if(profData){
                
                    if(authorisedProfessor?.department === profData?.department) {
                        
                        const dataToBeUpdated = {
                            firstName:firstName,
                            lastName:lastName,
                            Gender:Gender,
                            DOB:new Date(DOB),
                            email:userEmail
                        }

                        await userModule.updateOne({email:profData?.email},{email:userEmail})
                        
                        professor.updateOne({_id:profData?._id},dataToBeUpdated,(error,updatedData)=>{
                           
                            if(error) return res.status(500).send('server error')
                            if(!updatedData) return res.status(403).send('unable to update professor')
                            if(updatedData) return res.status(200).send('professor updated successfully...');    
                        })
                        

                    }
                }
            }

        }
        
    } catch (error) {
        res.status(401).send('you are not authorised')
    }
}

export {allProfessorGet,professorById,profCourses,professorPost,professorDelete,professorUpdate};