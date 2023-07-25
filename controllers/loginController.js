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
    const {username,password} = req.body;
    try {
        
        UserModel.findOne({username})
            .then(user => {

                compare(password,user?.password)
                .then(async passwordCheck => {
                    if(!passwordCheck){
                        return res.status(400).send("password dosn't match")
                    }
                        //create jwt token
                        await UserModel.findOneAndUpdate({username},{session:false},{new:true});

                        const token = jwt.sign({
                            userId:user?._id,
                        },process.env.JWT_SECRET,{expiresIn:'24h'})

                        return res.status(200).send({
                            msg:'login successfully...',
                            username:user?.username,
                            token
                        })

                }).catch(error => res.status(401).send("don't have password"))
            }).catch(error => {return res.status(404).send('username not found')})

    } catch (error) {
        return res.status(500).send({error});
    }

}