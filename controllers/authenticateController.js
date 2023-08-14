import jwt from "jsonwebtoken";
import student from "../modules/studentModel.js";
import professor from "../modules/professorModel.js";
import userModule from "../modules/user.module.js";

const authenticate = async(req,res)=>{
    try {
        const token = req.cookies.validatingToken;
        console.log('token : ',token)
        if(!token) return res.sendStatus(401);

        const {userId} = jwt.verify(token,process.env.JWT_REFRESH_TOKEN_SECRET)

        if(!userId) return res.sendStatus(401);
        
        const user = await userModule.findOne({_id:userId});

        if(!user) return res.sendStatus(401);

        if(user.refreshToken !== token)return res.sendStatus(401);

        let Model,auth;

        if(user?.role === 'student'){

            Model = student;
            auth = 'standerd';

        }
        
        if(user?.role === 'professor'){
            Model = professor
            auth = 'moderate'
        }

        if(user?.role === 'HOD'){
            Model = professor
            auth = 'high'
        }

        const userInfo = await Model.findOne({email:user?.email})

        const accessToken = jwt.sign({userId:user._id},process.env.JWT_ACCESS_TOKEN_SECRET,{expiresIn:'15m'})
 
        return res.status(200).send({token:accessToken,username:user?.username,profile:userInfo?.profile,firstName:userInfo?.firstName,auth,email:user?.email})

    } catch (error) {
        res.sendStatus(401)
    }

}



export {authenticate};