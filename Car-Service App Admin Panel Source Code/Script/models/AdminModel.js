const mongoose = require("mongoose");

const adminSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        unique: true,
        required: true,
    },
    image: {
        type: String,
        default: "", // Set a default value (optional)
    },
    phone: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    is_admin: {
        type: Number,
        default: 0,
    },
}, { timestamps: true });

module.exports = mongoose.model("Admin", adminSchema);
