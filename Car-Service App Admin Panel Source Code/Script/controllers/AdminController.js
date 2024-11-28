const fs = require("fs");
const path = require('path')
const userimages = path.join('./public/assets/userImages/');
const sha256 = require("sha256");
const Admin = require("../models/AdminModel");
const User = require("../models/UserModel");
const Booking = require("../models/VehicleBookingModel");
const VehicleType = require("../models/VehicleTypeModel");
const Service = require("../models/ServiceModel");
const Banner = require("../models/BannerModel");

// Load Admin Login Page
module.exports.adminLogin = async (req, res) => {
    try {
        res.render('login');
    } catch (error) {
        console.log(error.message);
    }
}

// Create Admin
module.exports.createAdmin = async (req, res) => {
    try {
        const { username, email, password, phone } = req.body;

        // Check if admin already exists
        const existingAdmin = await Admin.findOne({ email });
        if (existingAdmin) {
            return res.status(400).json({ success: 0, message: "Admin already exists" });
        }

        // Hash the password
        const hashedPassword = sha256.x2(password);

        // Create the admin
        const newAdmin = new Admin({
            username,
            email,
            password: hashedPassword,
            phone,
        });

        await newAdmin.save();
        return res.status(201).json({ success: 1, message: "Admin created successfully" });
    } catch (error) {
        console.error("Error creating admin:", error);
        return res.status(500).json({ success: 0, message: "Internal Server Error" });
    }
};



// Verify Admin
module.exports.VerifyAdmin = async (req, res) => {
    try {
        const password = sha256.x2(req.body.password);
        const email = req.body.email;
        const AdminData = await Admin.findOne({ email: email, password: password });
        if (AdminData) {
            req.session.user_id = AdminData._id;
            res.redirect('/dashboard');
        }
        else {
            res.render('login', { message: "Email and Password not correct" });
        }
    } catch (error) {
        console.log(error.message);
    }
}

// Load Dashboard
module.exports.loadDashboard = async (req, res) => {
    try {
        const banner = await Banner.find();
        const vehicleType = await VehicleType.find();
        const booking = await Booking.find();
        const users = await User.find();
        const service = await Service.find();   
        res.render('dashboard', { booking: booking, users: users, vehicleType: vehicleType, service: service, banner: banner});
    } catch (error) {
        console.log(error.message);
    }
}

// Admin Logout
module.exports.adminLogout = async (req, res) => {
    try {
        req.session.destroy();
        res.redirect("/login");
    } catch (error) {
        console.log(error.message);
    }
}

// Admin Profile
module.exports.adminProfile = async (req, res) => {
    try {
        const adminData = await Admin.findById(req.session.user_id);
        if (adminData) {
            res.render('profile', { admin: adminData });
        }
        else {
            console.log(error);
        }
    } catch (error) {
        console.log(error.message);
    }
}

// Edit Admin Profile
module.exports.editProfile = async (req, res) => {
    try {
        const id = req.session.user_id;
        if (req.file) {
            const updateProfile = await Admin.findByIdAndUpdate(id, { username: req.body.username, phone: req.body.phone, image: req.file.filename });
            if (updateProfile) {
                res.redirect('back');
            }
        }
        else {
            const updateProfile = await Admin.findByIdAndUpdate(id, { username: req.body.username, phone: req.body.phone });
        }
        res.redirect('back');
    } catch (error) {
        console.log(error);
    }
}

// Change Password
module.exports.changePassword = async (req, res) => {
    try {
        res.render('changePassword');
    } catch (error) {
        console.log(error.message);
    }
}

// Reset Admin Password
module.exports.resetAdminPassword = async (req, res) => {
    try {
        const oldpassword = sha256.x2(req.body.oldpassword);
        const newpassword = req.body.newpassword;
        const confirmPassword = req.body.cpassword;
        const id = req.session.user_id;
        const admin = await Admin.findOne({ _id: id, password: oldpassword });
        if (admin) {
            if (newpassword == confirmPassword) {
                const securePass = sha256.x2(newpassword);
                const adminInfo = await Admin.findByIdAndUpdate({ _id: id }, { $set: { password: securePass } });
                res.redirect('/dashboard');
            }
            else {
                res.render('changePassword', { message: "Confirm password not matched" });
            }
        }
        else {
            res.render('changePassword', { message: "old password not matched" });
        }
    }
    catch (error) {
        console.log(error.message);
    }
}
// View Users
module.exports.viewUsers = async (req, res) => {
    try {
        let loginData = await Admin.find({});
        const user = await User.find().sort({ updatedAt: -1 });
        res.render("users", { users: user, loginData: loginData });
    } catch (error) {
        console.log(error.message);
    }
}

// User Status
module.exports.userStatus = async (req, res) => {
    const { id } = req.params;
    try {
        const status = await User.findById(id);
        if (!status) {
            return res.sendStatus(404);
        }
        status.active = !status.active;
        await status.save();
        res.redirect('/users');
    } catch (err) {
        console.error(err);
        res.sendStatus(500);
    }
}

// Booked Appointment
// module.exports.BookedAppointment = async (req, res) => {
//     try {
//         const AllBooking = await Booking.find({}).populate(['userId', 'centerId', 'packageId']);
//         if (AllBooking) {
//             res.render('viewBooking', { booking: AllBooking });
//         }
//         else {
//             console.log(error);
//         }
//     } catch (error) {
//         console.log(error);
//     }
// }

// // Edit Booking
// module.exports.editBooking = async (req, res) => {
//     try {
//         let loginData = await Admin.find({});
//         const id = req.query.id;
//         const bookingInfo = await Booking.findById({ _id: id });
//         res.render('editBooking', { bookingInfo: bookingInfo,loginData:loginData });
//     } catch (error) {
//         console.log(error);
//     }
// }

// // Update Booking Status
// module.exports.updateBookingStatus = async (req, res) => {
//     try {
//         let loginData = await Admin.find({});
//         for (let i in loginData) {
//             if (String(loginData[i]._id) === req.session.user_id) {
//                 if (loginData[i].is_admin == 1) {
//                 const id = req.query.id;
//                 const updateStatus = await Booking.findByIdAndUpdate(id, { $set: { status: req.body.status } });
//                     if (updateStatus) {
//                         res.redirect('/view-booking');
//                     }
//                 }
//                 else {
//                     req.flash('error', 'You have no access to change status , You are not super admin !! *');
//                     return res.redirect('back');
//                 }
//             }
//         }

//     } catch (error) {
//         console.log(error);
//     }
// }
