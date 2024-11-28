const mongoose = require("mongoose");
const cancelOrderSchema = new mongoose.Schema ({
    
    userId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    bookingId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order'
    },
},

{ timestamps: true });


module.exports = mongoose.model('CancelledOrder',cancelOrderSchema);