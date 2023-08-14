import UserInfoModel from '../modules/userInfo.module.js';

const userIdentification = async(req,res)=>{

    const {_id,password,email,...rest} = Object.assign({},req.user.toJSON());

    common.findOne({userId:_id},(error,{userInfoId})=>{
        
        UserInfoModel.findOne({_id:userInfoId},(error,userInfo)=>{

            if(!error){
                
                if(userInfo?.firstName){

                    rest.firstName =  userInfo?.firstName;
            
                }
            
                res.status(200).send(rest);


            }
        });

    })

}

export default userIdentification;

/** GET:http://localhost:8000/api/user/example@123
 */
// export async function getUser(req,res){

    
// const {userId} = req.user;

//     let query = {};
    
//     try {
        
//         if(userId){
//             query._id = userId;
//         }

//         if(!query) return res.status(501).send({error:"Invalid username..."});
//         UserModel.findOne(query,async(error,user)=>{
//             if(error)return res.status(500).send({error});
//             if(!user) return res.status(501).send({error:"couldn't find user..."})
//             if(user) {
//                 const userInfo = await UserInfoModel.findOne({userId:userId})
//                 //remove the password from the user
//                 /* mongoose return unnecessory data with object so convert it into json */
//                 const {password,...rest} = Object.assign({},user.toJSON());
//                 const userInfo1 = Object.assign({},userInfo.toJSON()); 
//                 const Info ={...rest,...userInfo1};     

//                 return res.status(200).send(Info)
//             }
//         })

//     } catch (error) {
//         return res.status(404).send({error:' unable to find user...'})
//     }
// }

/** successfully redirect user when OTP is valid
 GET:http://localhost:8000/api/user/createResetSession
*/
// export async function createResetSession(req,res){
    
//     if(req.app.locals.resetSession){
//         req.app.locals.resetSession = false;
//         return res.status(201).send({msg:"access granted"});
//     }

//     return res.status(440).send({error:"session expired!"})
// }
