import mongoose from "mongoose";

const permissionSchema = new mongoose.Schema({
  name:{
    type:String,
    required:true,
    trim:true,
    uppercase:true,
    unique:true
  }
},{timestamps:true});

export const permissionModel = new mongoose.model("permission",permissionSchema);