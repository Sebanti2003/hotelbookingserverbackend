import User from "../models/user.model.js";
import { connectcloud } from "../utils/cloudinery.js";
import jwt  from "jsonwebtoken";
const generateaccesstokenandrefreshtoken=async(userID)=>{
    try {
        const user=await User.findById(userID);
        const accesstoken=await user.accesstokengenerate();
        const refreshtoken=await user.generaterefreshtoken();
        user.refreshToken=refreshtoken;
        await user.save({validateBeforeSave:false});
        return {accesstoken,refreshtoken};
    } catch (error) {
        throw new Error(error);
    }
}
export const registeruser=async(req,res,next)=>{
    try {
        const {username,email,password}=req.body;
        if(!username || !email || !password){
            return res.status(400).json({message:"All fields are required"});
        }
        const existinguser=await User.findOne({$or:[{username},{email}]});
        if(existinguser){
            return res.status(408).json({message:"User already exists"});
        }
        const avatarlocalpath=req?.files?.avatar?.[0]?.path;
        if(!avatarlocalpath){
            return res.status(400).json({message:"Please upload your avatar"});
        }
        const response=await connectcloud(avatarlocalpath);
        const avatarurl=response?.url;
        const newuser=await User.create({username,email,password,avatar:avatarurl});
        const responseuser=await User.findById(newuser._id).select("-password -_id -refreshtoken -__v -createdAt -updatedAt");
        return res.status(201).json({message:"User registered successfully",user:responseuser});

    } catch (error) {
       console.log("There is some registering and the following error is found: ",error);
       return res.status(500).json({message:"Internal server error"});
    }
}
export const loginuser=async(req,res,next)=>{
    try {
        const {username,password,email}=req.body;
        if(!username && !email){
            return res.status(400).json({message:"Atleast one field is required"});
        }
        if(!password){
            return res.status(400).json({message:"Password is required"});
        }
        const existinguser=await User.findOne({$or:[{username},{email}]});
        if(!existinguser){
            return res.status(404).json({message:"User not found"});
        }
        req.user=existinguser;
        const ispasswordcorrect=await existinguser.iscorrectpassword(password);
        if(!ispasswordcorrect){
            return res.status(401).json({message:"Invalid credentials"});
        }
        const {accesstoken,refreshtoken}=await generateaccesstokenandrefreshtoken(existinguser._id);
        if(!accesstoken || !refreshtoken){
            return res.status(500).json({message:"Internal server error"});
        }
        const responseuser=await User.findById(existinguser._id).select("-password -_id -refreshToken -__v -createdAt -updatedAt");
        const options={
            httpOnly:true,
            secure:true,
        }
        return res.status(201).cookie("accessToken",accesstoken,options).cookie("refreshToken",refreshtoken,options).json({message:"Login successful",user:responseuser,accesstoken:accesstoken,refreshtoken:refreshtoken});
    } catch (error) {
        console.log("There is some login error and the following error is found: ",error);
        return res.status(500).json({message:"Internal server error"});
    }

}
export const logoutuser=async(req,res,next)=>{
    try {
        console.log("req.user: ",req.user);
       const newuser=await User.findByIdAndUpdate(req?.user?._id,{$set:{refreshToken:""}},{new:true});
       const options={
           httpOnly:true,
           secure:true
       }
       res.status(200).clearCookie("accessToken",options).clearCookie("refreshToken",options).json({message:"Logout successful",user:newuser});
    } catch (error) {
        console.log("There is some logout and the following error is found: ",error);
        return res.status(500).json({message:"Internal server error"});
    }
}
export const refreshtokengeneratorafterlogin=async(req,res,next)=>{
    const incomingtoken=req?.cookies?.refresh_token||req.body.refresh_token;
    if(!incomingtoken){
        return res.status(404).json({message:"Refresh token not found"});
    }
    const decodedtoken=jwt.verify(incomingtoken,process.env.REFRESH_TOKEN_SECRET);
    const user=await User.findById(decodedtoken?._id);
    if(!user){
        return res.status(401).json({message:"problem in refresh token"});
    }
    if(decodedtoken!==user.refreshToken){
        return res.status(402).json({message:"Invalid refresh token"});
    }
    const {accesstoken,refreshtoken:reftok}=generateaccesstokenandrefreshtoken(user._id);
    const options={
        httpOnly:true,
        secure:true,
    }
    res.status(200).cookie("accessToken",accesstoken,options).cookie("refreshToken",reftok,options).json({message:"Refresh token generated",accesstoken:accesstoken,refreshtoken:refreshtoken});

}
