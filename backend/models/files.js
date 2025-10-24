import mongoose from "mongoose";
const fileSchema = new mongoose.Schema({
    path:{
        type:String,
        required:true
    },
    name:{
        type:String,
        required:true
    },
    downloadContent:{
        type: Number,
        required: true,
        default: 0
    },
    uploader:{
        type:String,
        required:true
    },
    room:{
        type:String,
        required:true
    }
})
const File = mongoose.models.File || mongoose.model("File", fileSchema);
export default File
