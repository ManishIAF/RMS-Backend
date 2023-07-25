import mongoose from 'mongoose'

const connect = async(URI)=>{

    // console.log("URI : ",URI);
    // const mongod = await MongoMemoryServer.create()

    // const getUri = mongod.getUri()

    mongoose.set('strictQuery',true)

    const db = await mongoose.connect(URI)

    console.log('database connected...');
 
    return db;
}

export default connect;