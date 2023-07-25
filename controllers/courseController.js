import course from "../modules/courseModel.js"
import professor from "../modules/professorModel.js";


const allCourses = async(req,res)=>{

    try {

        const { email,role} = req.user;
        
        professor.findOne({email:email},(error,profData)=>{
        
            if(error) return res.status(500).send('server error');
        
            if(!profData) return res.status(401).send('not authorised');

            if(profData){

                if(role === 'HOD'){

                    course.find({department:profData?.department},(error,courseData)=>{

                        if(error) return res.status(500).send('server error');
                        if(!courseData) return res.status(403).send('no course authorised');

                        if(courseData?.length) return res.status(200).send(courseData);
                    
                    })

                }else{
                    res.status(401).send('not authorised')
                }


            }

        })

    } catch (error) {
        
        res.status(500).send('server error');

    }
    
    

}

const coursePost = async(req,res)=>{

    try {
        

        const {email,role} = req.user;
        const {subjectId,profId} = req.body;

        if(role === 'HOD'){

            professor.findOne({_id:profId}).populate({
                path:'coursesId',
                match:{_id:subjectId}
            }).exec((error,profData)=>{
            
                if(error) return res.status(500).send('server error');
            
                if(!profData) return res.status(404).send('professor not found');

                if(profData){

                    console.log('profData : ',profData?.coursesId?.length);
                    if(profData?.coursesId?.length === 1){
                        
                        return res.status(409).send(`course has alresdy been alotted to Prof ${profData?.firstName}`)
                    
                    }

                    if(profData?.coursesId?.length === 0){

                        course.findOne({_id:subjectId}).populate({path:'professorId'}).exec((error,courseData)=>{
                            if(error) return res.status(500).send('server error');
                            if(!courseData) return res.status(404).send('wrong course');
                            if(courseData){
                                if(courseData?.department !== profData?.department){

                                    return res.status(401).send('you are not allowed to alter other department result');

                                }if(courseData?.professorId){

                                    return res.status(409).send(`course has alresdy been alotted to Prof ${courseData?.professorId?.firstName}`)
 
                                }else{
                                    professor.findByIdAndUpdate(profId,{$push:{coursesId:subjectId}},{ new: true },
                                        (error,updatedProfCourse)=>{
                                            if(error) return res.status(500).send('server error');
                                            if(updatedProfCourse){
                                                if( updatedProfCourse?.coursesId?.length>profData?.coursesId.length){
                                                    course.findByIdAndUpdate(subjectId,{professorId:profId},{new:true},
                                                        (error,updatedcourseData)=>{
                                                            if(error) return res.status(500).send('server error');
                                                            if(!updatedcourseData?.professorId){
                                                                return res.status(501).send('something bad happen');
                                                            }else if(updatedcourseData?.professorId){
                                                                return res.status(200).send({addedData:updatedcourseData,msg:'course alloted'});
                                                            }
                                                        })
                                                }
                                            }
                                        })
                                }

                            }
                        })

                        

                    }



                }
            
            })



        }else if(role !== 'HOD'){
            res.status(401).send('not authorised');
        }


    } catch (error) {
        res.status(500).send('server error')
    }

}

const courseById = async(req,res)=>{

    try {

        // console.log('courseById By Id called')
        
        const {id} = req.params;
// console.log('profId : ',id);
        professor.findOne({_id:id},(error,profData)=>{
            // console.log('Name : ',profData?.firstName);
            if(error) return res.status(500).send('server error');
        
            if(!profData) return res.status(401).send('not authorised');

            if(profData){

                 course.find({_id:{$in:profData?.coursesId}},(error,courseData)=>{

                    // console.log('courseData : ',courseData);

                    if(error) return res.status(500).send('server error');
        
                    if(!courseData) return res.status(403).send('no course authorised');

                    if(courseData?.length) return res.status(200).send(courseData);
                    
                })

            }

        })

    } catch (error) {
        
        res.status(500).send('server error');

    }
    
    
}

const courseDelete = (req,res)=>{

    try {

        const {role} = req.user;
        const {courseId,professorId} = req.body;
        
        if(role != 'HOD') return res.status(401).send('not authorised');

        if(role === 'HOD'){

            professor.findOne({_id:professorId},(error,profData)=>{
                if(error) return res.status(500).send('server error');
                if(!profData) return res.status(401).send('you are not authorised');
                if(profData){
                    course.findOne({_id:courseId},(error,courseData)=>{
                        if(error) return res.status(500).send('server error');
                        if(!courseData) return res.status(404).send('course not found');
                        if(courseData){
                            if(profData?.department != courseData?.department){
                                return res.status(401).send('you are not authorised to make changes to other department');
                            }
                            if(profData?.department === courseData?.department){

                                professor.updateOne({_id:profData?._id},{$pull:{coursesId:courseId}},(error,updatedProfData)=>{
                                    console.log('updatedProfData : ',updatedProfData);
                                    if(error) return res.status(500).send('server error');

                                    if(updatedProfData?.modifiedCount === 1){

                                        course.updateOne({_id:courseId},{ $unset: { professorId: '' } },(error,deletedCourseProf)=>{
                                            if(error) return res.status(500).send('server error');
                                            if(deletedCourseProf){
                                                return res.status(200).send('course romoved successfully')
                                            }
                                        })

                                    } 
                                    
                                    if(updatedProfData?.modifiedCount === 0){

                                        return res.status(403).send('unable to delete');

                                    }

                                })                                

                            }
                        }
                    })
                }
            })

        }

    } catch (error) {

        console.log(error);
        return res.status(500).send('server error');
        
    }


}


export {allCourses,coursePost,courseById,courseDelete};