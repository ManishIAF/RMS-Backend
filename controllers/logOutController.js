export async function login(req,res){
    try {
        const cookies = req.cookies.validatingToken;
        if(!cookies) return res.sendStatus(204);
        res.clearCookie('validatingToken',{ httpOnly:true,sameSite:'None',secure:'true' /*path:'/api/validateToken'*/})
        res.status(200).send('logged out successfully...')

    } catch (error) {
        return res.status(500).send({error});3
    }

}