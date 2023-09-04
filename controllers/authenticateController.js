import jwt from "jsonwebtoken";
import student from "../modules/studentModel.js";
import professor from "../modules/professorModel.js";
import userModule from "../modules/user.module.js";


const cookieValidation = async (refreshToken) => {
    try {

        const validRefreshToken = jwt.verify(refreshToken, process.env.JWT_REFRESH_TOKEN_SECRET);

        if (!validRefreshToken) {
            return { validation: false };
        }

        const user = await userModule.findOne({ _id: validRefreshToken.userId });

        if (!user) {
            return { validation: false };
        }

        if (user.refreshToken !== refreshToken) {
            return { validation: false };
        }

        const newAccessToken = jwt.sign({ userId: user._id }, process.env.JWT_ACCESS_TOKEN_SECRET, { expiresIn: '15m' });

        return { validation: true, newToken: newAccessToken, user };
    
    } catch (error) {
        return { validation: false};
    }
};

const authenticate = async (req, res) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];

        if (!token) return res.sendStatus(401);

        jwt.verify(token, process.env.JWT_ACCESS_TOKEN_SECRET, async (error, validAccessToken) => {
            
            let newAccessToken,newUser;

            if (error && error.name === 'TokenExpiredError') {

                const refreshToken = req.cookies.validatingToken;

                if (!refreshToken) return res.status(401).send({ error: "No refresh token provided" });

                const { validation, newToken, user } = await cookieValidation(refreshToken);

                if (!validation) return res.status(401).send({ error: "Token validation failed" });

                newAccessToken = newToken;
                newUser = user
            }

            const user = newUser ? newUser : await userModule.findOne({ _id: validAccessToken?.userId });

            if (!user) return res.sendStatus(401);

            let Model, auth;
            if (user.role === 'student') {
                Model = student;
                auth = 'standard';
            } else if (user?.role === 'professor' || user?.role === 'HOD') {
                Model = professor;
                auth = user?.role === 'professor' ? 'moderate' : 'high';
            }

            const userInfo = await Model.findOne({ email: user.email });

            return res.status(200).send({
                token: newAccessToken || token,
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




export {authenticate};