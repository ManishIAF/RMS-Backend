const calculateStatus = (rest)=>{

    if((rest.Internal/10)*100 < 40) false;
    if((rest.Theory/40)*100 < 40 ) false;
    if((rest.Practical/30)*100 < 40 ) false;

    return true;

}

const resultFilter = (results)=>{

    let filteredResults = [] 

    for(let i = 0 ; i<results.length ; i++){

        const {currentSemester,...rest} = results[i]
        
        if(rest.Semester === currentSemester){

            filteredResults.push(rest);
        
        }else if(rest.Semester !== currentSemester && !calculateStatus(rest)){
            
            filteredResults.push(rest);

        }


    }

    return filteredResults;

}

export default resultFilter