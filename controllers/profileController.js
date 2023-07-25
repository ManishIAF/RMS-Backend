import professor from '../modules/professorModel.js';
import studentModel from '../modules/studentModel.js';
import userInfoModule from '../modules/userInfo.module.js';
/** GET:http://localhost:8000/api/user/example@123
 */
export async function getProfessorProfile(req,res){

        try {
            
            const query = {};
            const {role,email} = req.user;
            const {studentId} = req.query;

            console.log('studentId : ',req.query);
            
            if(studentId){
                query._id = studentId
            }

            if(role === 'student'){
             
                if(!studentId){

                    query.email = email;

                }
            
            }

            if(!studentId){
                if(role === "professor" || 'HOD'){

                    professor.findOne({email:email}).populate({path:'coursesId'}).populate({path:'userInfoId'}).exec((error,profData)=>{

                        if(error) return res.status(500).send('server error');

                        if(!profData) return res.status(404).send('user not found');

                        if(profData){

                            const profileData = { 

                                _id:profData?._id,
                                profile:profData?.profile,
                                firstName:profData?.firstName,
                                lastName:profData?.lastName,
                                department:profData?.department,
                                email:profData?.email,
                                courses:profData?.coursesId,
                                contect:profData?.userInfoId
                        
                            }
                            res.status(200).send(profileData);

                        }

                    })

                }
            }

            if(studentId || role === 'student'){

                studentModel.findOne(query,(error,studentData)=>{

                    if(error) return res.status(500).send('server error');
                    if(!error){
                        if(!studentData) return res.status(404).send('student not found');
                        if(studentData){
                            // console.log(studentData);
                            res.status(200).send(studentData);
                        }
        
                    }
                })

            }


        
        } catch (error) {
            
            return res.status(404).send({error:' unable to find user...'})
        
        }
    
    }

export async function getProfileById(req,res){

    

}


export async function postProfile(req,res){
        try { 
    
            const Body = req.body;

            const {email,role} = req.user;
            // console.log();
            let Model
            
            if(role === 'student'){
            
                Model = studentModel;
            
            }
            
            if(role === 'professor'||'HOD'){
            
                Model = professor
            
            }
// console.log('Model : ',Model);
            Model.findOne({email:email},(error,profData)=>{
// console.log('userInfo : ',userInfo);
                if(error){
    
                    return res.status(500).send('server error');
    
                }
    
                if(!error){
    
                    if(profData){
    
                        if(profData?.userInfoId) return res.status(409).send('data already present')
    
                        if(!profData?.userInfoId){
                            const newUserInfo = new userInfoModule(
    
                                {
                                
                                    Mobile : Body?.Mobile,
                                    address :  {
    
                                        Street:Body?.Street,
                                        City:Body?.City,
                                        State:Body?.State,
                                        pinCode:Body?.pinCode,
                                        District:Body?.District,
                            
                                    }
                    
                                }
                            )
                
                            console.log('new : ',newUserInfo);
                        
                        newUserInfo.save((error,userSavedData)=>{
                console.log('saved data : ',userSavedData);
                            if(error){ 
                                console.log('error : ',error);
                                
                                return res.status(500).send('server error')
                            
                            };
                            
                            if(!error){
                            
                                if(userSavedData){
                                    
                                    console.log('useSavedData : ',userSavedData);
                                    
                                    Model.updateOne({email:email},{userInfoId:userSavedData?._id},(error,updatedData)=>{
                                        if(error){
                                        // console.log('error : ',error);
                                            return res.status(500).send('server error');
                                        
                                        }
                                        
                                        if(!error){
                                            if(updatedData){
    
                                                res.status(200).send('data saved');

                                            }
                                        }
                                                    

                                    })
                                                
                            
                                }
                            
                            }
                            
                        })
            
                    }

                }
            }
        })
         
            
        } catch (error) {
            return res.status(501).send({error:"unable to find user"})
        }
    
    
    }


/** PUT:http://localhost:8000/api/updateUser
 *@Param:{
    "id":"<userId>"
 }
 body:{
    "firstname":"manish",
    "lastname":"shaw",
    "address":"7,Chalta Road Kankinara",
    "email":"shawmanish2580@gmail.com",
    "profile":""

 }
 */
export async function updateProfile(req,res){
    try { 

        const Body = req.body;
        const {_id,email,role} = req.user;

        let Model
        if(role === 'student'){
        
            Model = studentModel;
        
        }
        
        if(role === 'professor'||'HOD'){
        
            Model = professor
        
        }

        Model.findOne({email:email},async(error,userInfo)=>{

        if(error){

            return res.status(500).send('server error');

        }

        if(!error){

            if(!userInfo?.userInfoId) return res.status(404).send('data not present')
// console.log('data found')
            if(userInfo?.userInfoId){

                if(Body?.profile){

                    Model.updateOne({email:email},{profile:Body?.profile},(error,userSavedData)=>{
            
                        if(error) return res.status(500).send('server error');
                
                        if(userSavedData) return res.status(200).send('data updated');
                
                    })
                }
                if(!Body?.profile){
                    const newUserInfo = 

                        {
                            Mobile : Body?.Mobile,
                            address :  {

                                Street:Body?.Street,
                                City:Body?.City,
                                State:Body?.State,
                                pinCode:Body?.pinCode,
                                District:Body?.District
                        
                            }
                
                        }
                
            
            
                    userInfoModule.updateOne({_id:userInfo?.userInfoId},newUserInfo,(error,userSavedData)=>{
            
                        if(error) return res.status(500).send('server error');
            
                        if(!error){
            
                            if(userSavedData){
            
                                res.status(200).send('data saved');
            
                            }
            
                        }
            
                    })
                }
        
            }
        }
    })
     
        
    } catch (error) {
        return res.status(501).send('unable to find user')
    }


}
