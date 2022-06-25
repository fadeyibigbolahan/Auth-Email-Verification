const { Schema, model } = require("mongoose");

const UserSchema = new Schema({
    name: {
        type: String,
        // required: true,
    },
    userName: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true,
    },
    gender: {
        type: String,
        enum: ["male", "female"],
    },
    confirmationCode: { 
        type: String, 
        unique: true
    },
    role: {
        type: String,
        enum: ['admin', 'supplier', 'agent', 'business', 'individual'],
        // default: "supplier",
    },
    phoneNumber: {
        type: String,
        default: ""
    },
    profilePicture: {
        type: String,
        default: ""
    },
    isVerified: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

module.exports = model('users', UserSchema)