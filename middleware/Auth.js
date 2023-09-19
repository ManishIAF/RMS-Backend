import { verify } from "jsonwebtoken";
import UserSchema from "../modules/user.module.js";

/* Authentication middleware */

const Auth = async(req,res,next) => {

    try {
        const token = req.headers.authorization.split(" ")[1];
        const decodedToken = verify(token, process.env.JWT_ACCESS_TOKEN_SECRET);
        const {userId} = decodedToken;

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