import {compare } from 'bcrypt';
import jwt from 'jsonwebtoken';
import UserModel from '../modules/user.module.js'

/** POST:http://localhost:8000/api/login
 *@Body:{

    "username":"example123",
    "password":"admin123",

 }
 */
 export async function login(req,res){
    try {

        const {username,password} = req.body;
        
        const user = await UserModel.findOne({username})

        if(!user) return res.status(404).send('user not found')

        const valid = await compare(password,user.password);

        if(!valid) return res.status(401).send('invalid password');
        
        const accessToken = jwt.sign({userId:user._id},process.env.JWT_ACCESS_TOKEN_SECRET,{expiresIn:'15m'})
        const refreshToken = jwt.sign({userId:user._id},process.env.JWT_REFRESH_TOKEN_SECRET,{expiresIn:'7d'})

        await UserModel.updateOne({_id:user?._id},{refreshToken:refreshToken});

        let auth;
        if (user.role === 'student') {
            auth = 'standard';
        } else if (user?.role === 'professor') {
            auth = 'moderate';
        }else if (user?.role === 'HOD') {
            auth = 'high';
        }

        res.status(200).cookie("validatingToken",refreshToken,{
            httpOnly:true,
            sameSite:'None',
            secure:true,
            // path:'/api/authenticate'
        }).send({
            msg:'login successfully...',
            token:accessToken,
            auth
        }) 

    } catch (error) {
        console.log('error : ',error)
        return res.status(500).send({error});
    }

}