const mongoose = require("mongoose");
const UserAddressSchema = new mongoose.Schema ({
    userId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    type:{
        type:String,
        required:true,
        trim:true
    },
    street:{
        type:String,
        required:true,
        trim:true
    },
    city:{
        type:String,
        required:true,
        trim:true
    },
    state:{
        type:String,
        required:true,
        trim:true
    },
    zipcode:{
        type:String,
        required:true,
        trim:true
    },
    country:{
        type:String,
        required:true,
        trim:true
    },
    is_default:{
        type:Boolean,
        default:true
    },
},
{ timestamps: true });
module.exports = mongoose.model('UserAddress',UserAddressSchema);
