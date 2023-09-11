import 'dotenv/config'
import express from "express";
import cookieParser from 'cookie-parser';
import cors from 'cors' 
import morgan from 'morgan';

const app = express()

/* middleware setup */

app.use(express.json());
app.use(cookieParser());

/* database connection */
import connect from "./database/connect.js";

/*importing routes */
import loginRoute from './router/loginRoute.js';
import authenticateRoure from './router/authenticateRoute.js';
import ProfileRoute from './router/ProfileRoute.js';
import studentRoute from './router/studentRoute.js';
import resultRoute from './router/resultRoute.js';
import verifyUserRouter from "./router/verifyUserRoute.js";
import professorRoute from './router/professorRoute.js';
import courseRoute from './router/coursesRoute.js';
import studentProfileRoute from './router/studentProfileRoute.js';
import prRoute from './router/prRoute.js';

app.use(cors(
    {
        origin:['https://rms-frontend-x9ue.onrender.com','https://wbsu-rms.web.app'],
        credentials: true,
        optionsSuccessStatus: 200,
        allowedHeaders:['Origin','X-Api-Key','X-Requested-With','Content-Type','Accept','Authorization'],
    }
));

app.use(morgan('tiny')); //to log all the http request in console
app.disable('x-powered-by'); //less hackers know about our stack

const  port = 8000;

app.get('/',(req,res)=>{

    res.status(200).json('Home GET Raquest');
    
});

/* api routes */
app.use('/api/veryfyUser',verifyUserRouter);
app.use('/api/login',loginRoute);
app.use('/api/authenticate',authenticateRoure);
app.use('/api/profile',ProfileRoute);
app.use('/api/course',courseRoute);
app.use('/api/students',studentRoute);
app.use('/api/studentprofile',studentProfileRoute)
app.use('/api/result',resultRoute);
app.use('/api/professor',professorRoute);
app.use('/api/passwordRecovery',prRoute);





/* start server only when database connected... */
const PORT = process.env.PORT || 5000;

connect(process.env.MONGODB_URI).then(()=>{
    try {
         app.listen(PORT,()=>{
            console.log(`Server connected to http://localhost:${port} `)
        })
        
    } catch (error) {
        console.log('can not connect to the server');
    } 
}).catch(error =>{
    console.log('invalid database connection...');
})