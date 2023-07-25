// import result from "../modules/resultModel.js";
import student from "../modules/studentModel.js";
// import course from "../modules/courseModel.js";

const studentProfile = async(req,res)=>{

    try {

        const {Id} = req.params;
console.log('query : ',req.params)
        student.findOne({_id:Id},(error,studentData)=>{

            if(error) return res.status(500).send('server error');
            if(!error){
                if(!studentData) return res.status(404).send('student not found');
                if(studentData){
                    // console.log(studentData);
                    res.status(200).send(studentData);
                }

            }
        })
    
    
        
    } catch (error) {

        console.log(error);
        
    }

}

export {studentProfile};