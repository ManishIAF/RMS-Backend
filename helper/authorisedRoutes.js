const routes = [

    {

        path : '/admin',
        name : 'Result List',
        ICN:101,
        accessLevel: ['professor','HOD']
        
    },
    {

        path : '/admin/students',
        name : 'Students',
        ICN:102,
        accessLevel: ['professor','HOD']

    },
    {

        path : '/admin/addResult',
        name : 'Add Result',
        ICN:103,
        accessLevel: ['professor','HOD']

    },
    // {

    //     path : '/admin/addStudent',
    //     name : 'Add Student',
    //     ICN:105,
    //     accessLevel: ['HOD']

    // },
    {

        path : '/admin/professorList',
        name : 'Professors',
        ICN:107,
        accessLevel: ['HOD']

    },
//     {

//         path : '/admin/addProfessor',
//         name : 'Add Professor',
//         ICN:106,
//         accessLevel: ['HOD']

// },
    
    // {

    //     path : '/admin/settings',
    //     name : 'Settings',
    //     accessLevel: ['HOD']

    // },

]

function authorisedRoute(role){

    const mappedRoutes = routes.map(route => {
        
        if (route.accessLevel.includes(role)) {
          return {path:route.path,name:route.name,ICN:route.ICN};
        } 
      
    });
    
    const filteredRoutes = mappedRoutes.filter(route => route !== undefined && route !== null);

    return filteredRoutes;

}

export default authorisedRoute;