import student from "../modules/studentModel.js";
import professor from "../modules/professorModel.js";

const authenticate = async(req,res)=>{

    const {username,role,email} = req.user;

    let Model,auth;

    if(role === 'student'){

        Model = student;
        auth = 'standerd';

    }
    
    if(role === 'professor'){
        Model = professor
        auth = 'moderate'
    }

    if(role === 'HOD'){
        Model = professor
        auth = 'high'
    }

    const userInfo = await Model.findOne({email:email})

    res.status(200).send({username,profile:userInfo?.profile,firstName:userInfo?.firstName,auth});

}

const verify = async(req,res)=>{

    const {role} = req.user;

    let auth;

    if(role === 'student'){

        auth = 'standerd';

    }
    
    if(role === 'professor'){
        auth = 'moderate'
    }

    if(role === 'HOD'){
        auth = 'high'
    }

    res.status(200).send({auth});

}


export {authenticate,verify};