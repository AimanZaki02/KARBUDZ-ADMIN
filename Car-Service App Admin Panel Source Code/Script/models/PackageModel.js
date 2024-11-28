const mongoose = require("mongoose");
const packageSchema = new mongoose.Schema ({
    
    title:{
        type:String,
        required:true,
        trim:true
    },
    image:{
        type:String,
        required:true,
        trim:true
    },
    price:{
        type:Number,
        required:true,
        trim:true
    },
    description:{
        type:String,
        required:true,
        trim:true
    },
    serviceId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Service'
    },
    gallery_images:[{
        type: String
    }],
    is_active:{
        type:Number,
        default:0
    }

},

{ timestamps: true });

module.exports = mongoose.model('Package',packageSchema);
