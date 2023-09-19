import jwt from "jsonwebtoken";
import student from "../modules/studentModel.js";
import professor from "../modules/professorModel.js";
import userModule from "../modules/user.module.js";


const refreshToken = async (req,res) => {
    try {

        console.log('refresh token process atarted...')
        
        const refreshToken = req.cookies.validatingToken;
        console.log('refreshToken : ',refreshToken);

        if (!refreshToken) return res.sendStatus(401);
        console.log('validRefreshToken...');

        const validRefreshToken = jwt.verify(refreshToken,process.env.JWT_REFRESH_TOKEN_SECRET);
        console.log('validRefreshToken : ',validRefreshToken);

        if (!validRefreshToken) {
            return res.sendStatus(401);
        }

        const user = await userModule.findOne({ _id: validRefreshToken.userId });

        if (!user) {
            return res.sendStatus(401);
        }
console.log(user?.refreshToken === refreshToken);
        if (user?.refreshToken !== refreshToken) {
            return res.sendStatus(401);
        }

        console.log('reached end...');
        const newAccessToken = jwt.sign({ userId: user._id }, process.env.JWT_ACCESS_TOKEN_SECRET, { expiresIn: '15s' });

        return res.status(200).send(newAccessToken);
    
    } catch (error) {

        console.log('error : ',error);
        return res.sendStatus(401);

    }
};

const authenticate = async (req, res) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];

        if (!token) return res.sendStatus(401);

        jwt.verify(token, process.env.JWT_ACCESS_TOKEN_SECRET, async(error, validAccessToken) => {
            

            if (error && error.name === 'TokenExpiredError') {

                // const refreshToken = req.cookies.validatingToken;

                // if (!refreshToken) return res.status(401).send({ error: "No refresh token provided" });

                // const { validation, newToken, user } = await cookieValidation(refreshToken);

                // if (!validation) return res.status(401).send({ error: "Token validation failed" });

                // newAccessToken = newToken;
                // newUser = user
                console.log('token expired...')
                return res.sendStatus(403)
            }

            const user = await userModule.findOne({ _id: validAccessToken?.userId });

            if (!user) return res.sendStatus(401);

            let Model, auth;
            if (user.role === 'student') {
                Model = student;
                auth = 'standard';
            } else if (user?.role === 'professor') {
                Model = professor;
                auth = 'moderate';
            }else if (user?.role === 'HOD') {
                Model = professor;
                auth = 'high';
            }

            const userInfo = await Model?.findOne({ email: user?.email });

            return res.status(200).send({
                token: token,
                username: user.username,
                profile: userInfo?.profile,
                firstName: userInfo?.firstName,
                auth,
                email: user.email
            });
        });

    } catch (error) {
        res.sendStatus(401);
    }
}




export {authenticate,refreshToken};