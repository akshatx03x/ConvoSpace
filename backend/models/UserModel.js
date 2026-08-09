import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
    name:{
        type: String,
        required: true,
    },
    userName:{
        type: String,
        required: true,
        unique: true,
    },
    email:{
        type: String,
        required: true,
    },
    password:{
        type: String,
        required: false,
    },
    avatar:{
        type: String,
    },  
    phoneNumber:{
        type: String,
    },
    googleId:{
        type: String,
        unique: true,
        sparse: true,
    },
})

const User = mongoose.models.User || mongoose.model('User', UserSchema);

export default User;
