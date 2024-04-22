
import mongoose from "mongoose";
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken'

const userSchema=new mongoose.Schema({
    username:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    avatar:{
        type:String
    },
    refreshToken:{
        type:String
    }
},{timestamps:true});

userSchema.methods.iscorrectpassword=async function(password){
    return await bcrypt.compare(password,this.password);
}

userSchema.methods.accesstokengenerate=async function(){
    return jwt.sign({_id:this._id,username:this.username,email:this.email},process.env.ACCESS_TOKEN_SECRET,{expiresIn:process.env.ACCESS_TOKEN_EXPIRES_IN});
}

userSchema.methods.generaterefreshtoken=async function(){
    return jwt.sign({_id:this._id},process.env.REFRESH_TOKEN_SECRET,{expiresIn:process.env.REFRESH_TOKEN_EXPIRES_IN});
}



userSchema.pre('save',async function(next){
    if(!this.isModified('password')) return next();
    this.password=await bcrypt.hash(this.password,10);
    next();
})






const User=mongoose.model('User',userSchema);

export default User;