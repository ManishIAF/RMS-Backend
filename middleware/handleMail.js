import nodeMailer from 'nodemailer';
import Mailgen from 'mailgen';


const handleMail = async ({username , email:userMail , text , subject}) =>{

   try {
    console.log('userMail : ',userMail);
    const config = {
        // service : 'gmail',
        host:'smtp.gmail.com',
        port:587,
        secure:false,
        requireTLS:true,
        auth : {
            user : process.env.E_mail,
            pass : process.env.PASSWORD
        }
    }

    let transporter = nodeMailer.createTransport(config)

    let Mailgenerator = new Mailgen({
        theme : 'default',
        product : {
            name : 'Manish shaw', // add your 
            link : 'https://google.com/' // can add your website link
        }
    })

    let response = {
        body : {
            name :username, // user name
            intro : text,
            // table : {
            //     data : [
            //         {
            //             item : "Nodemailer stack book" ,
            //             description : " A Backend application",
            //             price : '4546 RS'
            //         }
            //     ]
            // },
            // outro : 'DO not shere thih OTP with any one'
        }
    }
    
    let emailBody = Mailgenerator.generate(response);
    let message = {
        from : process.env.E_mail,  
        to : userMail,
        subject : subject || 'Password Recovery OTP',
        html : emailBody,
    }

    // console.log('message : ',message);

    transporter.sendMail(message,(error,info)=>{
        if (error) {
            console.log(error);
            return false
        } 
        if(info) {
            console.log('Email sent: ' + info.response);
            return true;
        }
    })
    // console.log('status : ',status);
    // return Promise.resolve(status);

   } catch (error) {
  
        return false;

        // return Promise.reject({error})
  
    }
}

export default handleMail;