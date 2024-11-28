const mongoose = require("mongoose");
const ServiceSchema = new mongoose.Schema ({
    
    name:{
        type:String,
        required:true
    },
    image:{
        type:String,
        required:true
    },
    is_active:{
        type:Number,
        default:0
    }
    
},

{ timestamps: true });

module.exports = mongoose.model('Service',ServiceSchema);