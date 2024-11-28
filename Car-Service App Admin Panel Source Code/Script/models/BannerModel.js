const mongoose = require("mongoose");
const bannerSchema = new mongoose.Schema ({

    title:{
        type:String,
        required:true
    },
    image:{
        type:String,
        required:true
    },
    serviceId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Service',
    },
    is_active:{
        type:Number,
        default:0
    }
},

{ timestamps: true });

module.exports = mongoose.model('Banner',bannerSchema);
