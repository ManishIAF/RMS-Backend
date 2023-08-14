import professor from '../modules/professorModel.js';
import studentModel from '../modules/studentModel.js';
import userInfoModule from '../modules/userInfo.module.js';

export async function getProfile(req,res){

        try {
            
            const {role,email} = req.user;
            let data;
            if(role === 'professor' || 'HOD'){
                data = await professor.findOne({email:email}).populate({path:'userInfoId'}).populate({path:'coursesId'});
            }

            if(role === 'student'){
                data = await studentModel.findOne({email:email}).populate({path:'userInfoId'})
            }

            if(!data) return res.status(404).send('user not found');

            if(data){

                const DataToSend = { 

                    _id:data?._id,
                    profile:data?.profile,
                    firstName:data?.firstName,
                    lastName:data?.lastName,
                    department:data?.department,
                    Semester:data?.Semester,
                    Roll_Number:data?.Roll_Number,
                    Registration_Number:data?.Regitration_Number,
                    email:data?.email,
                    courses:data?.coursesId,
                    contact:data?.userInfoId
            
                }
                return res.status(200).send(DataToSend);
            }

        } catch (error) {
            
            return res.status(404).send({error:' unable to find user...'})
        
        }
    
    }

export async function getProfileById(req,res){
    res.status(200).send('profile by Id called')
}

export async function postProfile(req,res){
        try { 
    
            const Body = req.body;

            const {email,role} = req.user;

            let Model
            
            if(role ==='student'){
            
                Model = studentModel;
            
            }
            
            if(role === 'professor'||role === 'HOD'){
            
                Model = professor
            
            }

            Model.findOne({email:email},(error,profData)=>{

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
                
                        
                        newUserInfo.save((error,userSavedData)=>{

                            if(error){ 
                                
                                return res.status(500).send('server error')
                            
                            };
                            
                            if(!error){
                            
                                if(userSavedData){
                                    
                                    
                                    Model.updateOne({email:email},{userInfoId:userSavedData?._id},(error,updatedData)=>{

                                        if(error){

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

export async function updateProfile(req,res){
    try { 

        const Body = req.body;
        const {email,role} = req.user;

        let Model
        if(role === 'student'){
        
            Model = studentModel;
        
        }
        
        if(role === 'professor'||role === 'HOD'){
        
            Model = professor
        
        }

        Model.findOne({email:email},async(error,userInfo)=>{

        if(error){

            return res.status(500).send('server error');

        }

        if(!error){

            if(!userInfo?.userInfoId) return res.status(404).send('data not present')

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
