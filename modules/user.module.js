import { Schema,model } from "mongoose";

export const UserSchema = new Schema({

    username : {
        type:String,
        required:[true,"Please provide unique username"],
        unique : [true,"username already exist"],
    },
    password : {
        type:String,
        required:[true,"Please provide a password"],
        unique : false,
    },
    email : {
        type:String,
        required:[true,"Please provide an email"],
        unique : true,
    },
    role : {
        type:String,
        default:"student",
        required:true,
    },

    refreshToken:{
        type:String,
        required:true
    } 

})

export default model.Users || model('User',UserSchema);