import student from "../modules/studentModel.js";

const studentProfile = async(req,res)=>{

    try {

        const {Id} = req.params;
        const studentData = await student.findOne({_id:Id}).populate({path:'userInfoId'})

        if(!studentData) return res.status(404).send('student not found');
        if(studentData){
            const DataToSend = { 

                _id:studentData?._id,
                profile:studentData?.profile,
                firstName:studentData?.firstName,
                lastName:studentData?.lastName,
                DOB:studentData?.DOB,
                Gender:studentData?.Gender,
                Registration_Year:studentData?.Registration_Year,
                department:studentData?.department,
                Semester:studentData?.Semester,
                Roll_Number:studentData?.Roll_Number,
                Registration_Number:studentData?.Regitration_Number,
                email:studentData?.email,
                contact:studentData?.userInfoId
        
            }
            res.status(200).send(DataToSend);
        }
        
    } catch (error) {

        console.log(error);
        
    }

}

export {studentProfile};