const mongoose = require("mongoose");
const PackageReviewSchema = new mongoose.Schema ({

    packageId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Package'
    },
    userId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    description:{
        type:String,
        required:true
    },
    date:{
        type:String,
        required:true
    },
    time:{
        type:String,
        required:true
    },
    rating:{
        type: Number,
        required: true
    },
    is_active:{
        type: Boolean,
        default: true       
    }
},

{ timestamps: true });
module.exports = mongoose.model('PackageReview',PackageReviewSchema);
