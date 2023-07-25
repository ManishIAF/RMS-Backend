import jwt,{ verify } from 'jsonwebtoken';
import { hash } from 'bcrypt';
import User from '../modules/user.module.js'
import handleMail from '../middleware/handleMail.js'
import qrcode from 'qrcode'

const verifyToken = async(req,res) =>{

try {
 
    const {token} = req.params

    if(!token) return res.status(404).send('token not found')

    verify(token, process.env.JWT_SECRET,(error,decodedToken)=>{
        
        console.log('decodedToken : ',decodedToken);
        
        if(error) return res.status(401).send('invalid token')
        res.status(200).send('valid')  


    });
    
} catch (error) {
   
    if(error) return res.status(404).send('invalid token')
    
}


}

const passwordRecoveryPost = async (req, res) => {

    try {

      const {username} = req.body;

      User?.findOne({username},async(error,userData)=>{
        
        if(error) return res.status(500).send('server error');
            
        const resetToken = jwt.sign({ _id:userData?._id }, process.env.JWT_SECRET, { expiresIn: '5m' });

        const resetUrl = `${process.env.BASE_URL}/${resetToken}`;
        const qrCodeImage = await qrcode.toDataURL(resetUrl);

        const text = `
                    <div><p>Click on this <a href= "${resetUrl}" >link here</a> or scan the QR code to reset your password:</p> 
                    <img src="cid:${qrCodeImage}" alt="qr Image" />
                    <p>The Link will be invalid in 5 minutes</p></div>
                    `

        await handleMail({username,email:userData?.email,text,subject:'Password Recovery E-mail'})

        res.status(200).send('password recovery link sent to your mail');
      })


    } catch (err) {

        res.sendStatus(500);

    }
}


/*PUT:http://localhost:8000/api/user/resetPassword
*/

const resetPassword = async(req,res)=>{

    try {

        const {password,token} = req.body;

        const decodedToken = verify(token, process.env.JWT_SECRET);

        if(!decodedToken) return res.status(401).send('invalid token');

        User.findOne({_id:decodedToken?._id})
            .then( user => {
                hash(password,10)
                    .then(hashedPassword => {

                        User.updateOne({_id : decodedToken?._id} ,

                            {password : hashedPassword} , (error,data) => {
                                res.status(201).send("password changed...")
                            })
                    }

                    ).catch(error => res.status(500).send("unable to hash password"))
                }
                
            ).catch( error => res.status(404).send("username not found"))

    } catch (error) {

        return res.status(401).send('invalid token')

    }

}

export {verifyToken,passwordRecoveryPost,resetPassword}