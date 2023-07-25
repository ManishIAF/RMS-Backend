import mongoose,{ Schema,model } from "mongoose";

export const UserInfoSchema = new Schema({

    Mobile : Number,
    address : {

        Street:String,
        City:String,
        State:String,
        pinCode:Number,
        District:String
        
    },

})

export default model.Users || model('UserInfo',UserInfoSchema);