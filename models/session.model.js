import mongoose from "mongoose";

const sessionSchema = new mongoose.Schema({
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"user"
    },
})

export const sessionModel = new mongoose.model("session",sessionSchema);