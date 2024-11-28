const mongoose = require("mongoose");
const ReviewSchema = new mongoose.Schema ({

    
    userId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    centerId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Center'
    },
    review:{
        type:String,
        required:true
    },
    rate:{
        type:Number,
        required:true
    }
},

{ timestamps: true });



module.exports = mongoose.model('Review',ReviewSchema);
