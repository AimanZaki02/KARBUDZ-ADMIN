const mongoose = require("mongoose");
const TimeSlotSchema = new mongoose.Schema ({
    
    slot_duration: {
        type:String,
        required: true,
        trim:true
    },
    working_days: {
        type: Array,
        required: true
    },
    timings: {
        type: String,
        required: true,
        trim:true
    },
    week_off_days: {
        type: Array,
        required: true
    },
},

{ timestamps: true });

module.exports = mongoose.model('TimeSlot', TimeSlotSchema);