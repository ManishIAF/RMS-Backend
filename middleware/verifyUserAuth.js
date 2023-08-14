import UserModel from '../modules/user.module.js'
import professor from '../modules/professorModel.js';
import student from '../modules/studentModel.js';

const verifyUserAuth = async(req,res,next)=>{

    try {

        const {username} = req.method == 'GET' ? req.query : req.body;

        const exist = await UserModel.findOne({username});

        if(!exist){
            return res.status(404).send("can't find user...!")
        }

        if(exist){

            let Model
        
            if(exist?.role === 'student'){
                Model = student;
            }

            if(exist?.role === 'professor'||exist?.role ==='HOD'){
                Model = professor
            }

            const userInfo = await Model.findOne({email:exist?.email})
            res.status(200).send({username:exist?.username,firstName:userInfo?.firstName,profile:userInfo?.profile,msg:'user varified'})

        }
        
    } catch (error) {
        return res.status(404).send('Authentication Error...')
    }

}

export default verifyUserAuth