const mongoose = require("mongoose");
const refundedOrderSchema = new mongoose.Schema ({
    
    userId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    bookingId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order'
    },
    refunded_screenshot:{
        type:String
    },
},

{ timestamps: true });


module.exports = mongoose.model('RefundedOrder',refundedOrderSchema);