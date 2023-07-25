import UserModel from '../modules/user.module.js'
import otpGenerator from 'otp-generator'
import handleMail from '../middleware/handleMail.js';


/** GET:http://localhost:8000/api/user/generateOTP
*/
export async function generateOTP(req,res){

    const {username} = req.query

    // req.app.locals.OTP = otpGenerator.generate(6,{lowerCaseAlphabets:false,upperCaseAlphabets:false,specialChars:false})
    const subject = "Password Recovery OTP";
    const OTP = otpGenerator.generate(6,{lowerCaseAlphabets:false,upperCaseAlphabets:false,specialChars:false}) 
    const text = `Your Password Recovery OTP is ${OTP}.Verify and recover your password`;

    UserModel.findOne({username},(error,userData)=>{

        if(error) return res.status(500).send('server error');

        if(!userData) return res.status(404).send('user not found')

        if(userData){
            UserModel.updateOne({email:userData?.email},{genOTP:OTP,session:true},{new:true},(error,userUpdatedData)=>{
                console.log('updated : ',userUpdatedData);
                if(error) return res.status(500).send('server error');
                if(userUpdatedData?.modifiedCount === 1){
                    console.log('ready to send mail');
                    const sent = handleMail({username,email:userData?.email,subject,text})
                    console.log('sent : ',sent);
                    if(sent){

                        console.log('sent : ',sent);
                        res.status(200).send('OTP sent Successfully');

                    }

                }
            });
        }

    })

}
    


/** GET:http://localhost:8000/api/user/verifyOTP
*/
export async function verifyOTP(req,res){

    try {

        const {username,code} = req.body; 
console.log('type of code : ',typeof(code))
        UserModel.findOne({username},async(error,userInfo)=>{
            
            if(error) return res.status(500).send('server error');

            if(!userInfo) return res.status(404).send('user not found');

            if(userInfo?.session === false) return res.status(408).send('session expired');

            if(userInfo?.session === true){
                if(userInfo?.genOTP !== code) return res.status(409).send('wrong OTP');
                if(userInfo?.genOTP === code) {
                    await UserModel.updateOne({username},{genOTP:'',session:false},{new:true})
                    res.status(200).send('OTP Verified')
                
                }
            }

        })
        
    } catch (error) {
        
    }
    


}