import { verify } from "jsonwebtoken";
import UserSchema from "../modules/user.module.js";

/* Authentication middleware */

const Auth = async(req,res,next) => {

    try {

        const token = req.headers.authorization.split(" ")[1];

        //retrive the user detailes of the logged in user...
        
        const decodedToken = verify(token, process.env.JWT_SECRET);
        const {userId} = decodedToken;

        if(!userId){

            return res.status(401).send("Authentication failed...")

        };
        
        if(userId){
            
            const refs = await UserSchema.findOne({_id:userId});
        
            if(!refs) {

                return res.status(401).json("Authentication failed...")
            
            }
        
            if(refs){

                req.user = refs       
                next()

            }
    
        }
        

    } catch (error) {
        return res.status(401).send("Authentication failed...")
    }

}

export default Auth;