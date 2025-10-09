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
        required: true,
    },
    avatar:{
        type: String,
    },  
    phoneNumber:{
        type: String,
    },

})

const User = mongoose.models.User || mongoose.model('User', UserSchema);

export default User;
