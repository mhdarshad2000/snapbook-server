const mongoose = require('mongoose')

const adminSchema = mongoose.Schema({
    username:{
        type:String,
        required:[true,"Username is required"],
        trim:true,
        text:true,
        unique:true
    },
    password:{
        type:String,
        required:[true,"password is required"],
    },
})

module.exports = mongoose.model("Admin",adminSchema)