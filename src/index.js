import dotenv from 'dotenv';
dotenv.configDotenv();
import { app } from './app.js';
import { connectDB } from './db/connection.js';

//DATABASE CONNECTION
connectDB();

//SERVER LISTENING ON PORT
const PORT=process.env.PORT || 5000;
app.listen(PORT,()=>{
    console.log(`Server is running on port ${PORT}`);
});