import 'dotenv/config'
import express from "express";

const app = express()

import axios from "axios"

app.use((req, res, next) => {
    // Replace 'https://rms-frontend-x9ue.onrender.com' with the URL of your frontend app
    res.redirect('https://rms-frontend-x9ue.onrender.com' + req.url);
  });
// import http from 'http'
// import {Server as socketIO} from 'socket.io';
// import cors from 'express';
import cors from 'cors' 
// import qrcode from 'qrcode'
import morgan from 'morgan';
/* database connection */
import connect from "./database/connect.js";

/*importing routes */
import loginRoute from './router/loginRoute.js'
import authenticateRoure from './router/authenticateRoute.js'
import professorProfileRoute from './router/professorProfileRoute.js'
import studentRoute from './router/studentRoute.js'
import resultRoute from './router/resultRoute.js'
import verifyUserRouter from "./router/verifyUserRoute.js";
import professorRoute from './router/professorRoute.js'
import courseRoute from './router/coursesRoute.js'
import studentProfileRoute from './router/studentProfileRoute.js'
import prRoute from './router/prRoute.js'

// const socketServer = http.createServer(app);
// const io = new socketIO(socketServer,{
//     path: '/api/passwordRecovery'
// });

/* middleware setup */

app.use(express.json());
app.use(cors(
    {
    origin:'https://rms-frontend-x9ue.onrender.com',
    credentials: true,
    optionsSuccessStatus: 200,
    Headers:['Origin','X-Api-Key','X-Requested-With','Content-Type','Accept','Authorization'],
    // methods: ['GET','HEAD','PUT','PATCH','POST','DELETE'],
    // preflightContinue:false,
    // sameSite: 'lax',
    "Access-Control-Allow-Origin": "https://rms-frontend-x9ue.onrender.com",
    // "Access-Control-Allow-Credentials": "true",
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
app.use('/api/profile',professorProfileRoute);
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