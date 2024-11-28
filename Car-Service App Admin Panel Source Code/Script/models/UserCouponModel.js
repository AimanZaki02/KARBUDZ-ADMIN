const mongoose = require("mongoose");
const userCouponSchema = new mongoose.Schema ({

    userId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    coupon_code:{
        type:String,
        required:true
    },
},

{ timestamps: true });

module.exports = mongoose.model('UserCoupon',userCouponSchema);