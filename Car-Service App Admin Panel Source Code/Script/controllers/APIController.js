//const entities = require('entities');
//const {decode} = require('html-entities');
//const he = require('he');
require('dotenv').config();
const nodemailer = require('nodemailer');
let otpgenerator = require('otp-generator');
const jwt = require("jsonwebtoken");
const sha256 = require("sha256");
const path = require('path');
const hbs = require('nodemailer-express-handlebars');
const sendinBlue = require('sendinblue-api');
const FCM = require('fcm-node');
const User = require("../models/UserModel");
const UserOTP = require("../models/UserOTPModel");
const PasswordOTP = require("../models/PasswordOTPModel");
const Intro = require("../models/IntroModel");
const Banner = require("../models/BannerModel");
const VehicleType = require("../models/VehicleTypeModel");
const Service = require("../models/ServiceModel");
const Package = require("../models/PackageModel");
const UserVehicle = require("../models/UserVehiclesModel");
const SMTP = require("../models/SMTPModel");
const PaymentGateway = require('../models/PaymentGatewayModel');
const TimeSlot = require('../models/TimeSlotModel');
const VehicleBooking = require('../models/VehicleBookingModel');
const SlotBooking = require('../models/SlotBookingModel');
const Notification = require('../models/NotificationModel');
const UserAddress = require('../models/UserAddressModel');
const Coupon = require('../models/CouponModel');
const UserCoupon = require('../models/UserCouponModel');
const RefundedOrder = require('../models/RefundedOrderModel');
const PackageReview = require('../models/PackageReviewModel');
const StandardRate = require('../models/StandardRatesModel');
const Page = require('../models/PageModel');
const Currency = require('../models/CurrencyModel');
const CancelledOrder = require('../models/CancelledOrderModel');

// Firebase Push Notification
function sendPushNotification(serverKey, registrationToken, title, body, callback) {
    const fcm = new FCM(serverKey);
    const message = {
        notification: {
            title: title,
            body: body,
        },
        to: registrationToken,
    };
    fcm.send(message, function (err, response) {
        if (err) {
            console.log("Something has gone wrong!", err);
            callback(err, null);
        } else {
            console.log("Push notification sent.", response);
            callback(null, response);
        }
    });
}

// Check User Already Registered
module.exports.VerifyRegisteredUser = async (req, res) => {
    try {
        const emailExist = await User.findOne({ email: req.body.email });
        if (emailExist) {
            return res.json({ "data": { "success": 1, "message": "Email address already registered, please log in..!!*", "error": 0 } });
        }
        else {
            return res.json({ "data": { "success": 0, "message": "Please Sign up..!!", "error": 1 } });
        }
    } catch (error) {
        return res.json({ "data": { "success": 0, "message": error, "error": 1 } });
    }
}

// Send OTP
const SendOTP = async (name, email, OTP) => {
    try {
        const smtp = await SMTP.findOne({});
        const transporter = nodemailer.createTransport({
            host: smtp.host,
            port: smtp.port,
            secure: false,
            requireTLS: true,
            auth: {
                user: smtp.email,
                pass: smtp.password
            }
        });
        const handlebarOptions = {
            viewEngine: {
                partialsDir: path.resolve('./views/mail-templates/user-auth/'),
                defaultLayout: false,
            },
            viewPath: path.resolve('./views/mail-templates/user-auth/'),
        };
        // use a template file with nodemailer
        transporter.use('compile', hbs(handlebarOptions));

        // Define the path to your image file
        const imgPath = path.resolve('./public/assets/media/logos/logo.png');

        // Attach the image to the email
        const attachment = {
            filename: 'logo.png',
            path: imgPath,
            cid: 'unique@nodemailer.com' // use cid as the URL in the img src
        };

        const mailoptions = {
            from: smtp.email,
            template: "signupOTP",
            to: email,
            subject: 'User Registration Verification',
            context: {
                imgUrl: "assets/media/logos/logo.png",
                name: name,
                OTP: OTP
            },
            attachments: [attachment]
        }
        transporter.sendMail(mailoptions, function (error, info) {
            if (error) {
                console.warn(error);
            }
            else {
                console.log("message has been sent", info.response);

            }
        })

    } catch (error) {
        console.warn(error);
    }
}

// User Registration
module.exports.SignUp = async (req, res) => {
    try {
        const pass = sha256.x2(req.body.password);

        const userData = new User({
            firstname: req.body.firstname,
            lastname: req.body.lastname,
            username: req.body.username,
            email: req.body.email,
            password: pass,
            country_code: req.body.country_code,
            phone: req.body.phone
        });

        // Check if email already exist
        const emailExist = await User.findOne({ email: req.body.email });

        if (emailExist) {

            // Generate OTP
            let OTP = otpgenerator.generate(4, { lowerCaseAlphabets: false, upperCaseAlphabets: false, specialChars: false });

            SendOTP(emailExist.firstname, emailExist.email, OTP);

            // Delete past OTP record
            const delPastRecord = await UserOTP.deleteOne({ email: emailExist.email });

            // Save new OTP
            const otpMail = await UserOTP.create({
                email: emailExist.email,
                OTP: OTP
            });

            return res.json({ "data": { "success": 0, "message": "Email already registered. Verify your OTP to continue..!!*", "error": 1 } });
        }
        else {
            const saveUser = await userData.save();

            // Generate OTP
            let OTP = otpgenerator.generate(4, { lowerCaseAlphabets: false, upperCaseAlphabets: false, specialChars: false });

            // Send OTP
            SendOTP(saveUser.firstname, saveUser.email, OTP);

            // Delete past OTP record
            const delPastRecord = await UserOTP.deleteOne({ email: saveUser.email });

            // Save new OTP
            const otpMail = await UserOTP.create({
                email: saveUser.email,
                OTP: OTP
            });

            // Save the new device
            const newDevice = new Notification({
                userId: saveUser._id,
                registrationToken: req.body.registrationToken,
                deviceId: req.body.deviceId,
                is_active: 1
            });

            await newDevice.save();

            if (saveUser) {
                return res.json({ "data": { "success": 1, "message": "Welcome to our Car-Service App! You're all set. Check your email for the verification code..!!", "error": 0 } });
            }
            else {
                return res.json({ "data": { "success": 0, "message": "User registration failed. Account not recognized..!!*", "error": 1 } });
            }
        }

    }

    catch (error) {
        return res.json({ "data": { "success": 0, "message": error, "error": 1 } });
    }
}

// OTP Verification
module.exports.OTPVerification = async (req, res) => {
    try {
        const email = req.body.email;

        // Check if email exist
        const findUser = await UserOTP.findOne({ email: email });

        // Check if email exist
        if (findUser) {

            // Check if OTP matched
            if (findUser.OTP == req.body.otp) {

                // Update user as verified
                const userEmail = await User.findOneAndUpdate({ email: email }, { $set: { is_verified: 1 } });

                // Delete matched OTP record
                const DelMatched = await UserOTP.deleteOne({ email: userEmail.email });

                // Check if user verified
                if (userEmail.is_verified == 1) {

                    return res.json({ "data": { "success": 0, "message": "OTP Mismatch: Please check the OTP and try again..!!*", "error": 1 } });
                }
                else {

                    // Create a new JWT token
                    const token = jwt.sign({ id: userEmail._id }, process.env.SESSION_SECREAT);

                    // Send the response
                    return res.json({
                        "data": {
                            "success": 1,
                            message: "Successfully logged user..!!",
                            token: token,
                            userDetails: {
                                id: userEmail._id,
                                firstname: userEmail.firstname,
                                lastname: userEmail.lastname,
                                username: userEmail.username,
                                email: userEmail.email,
                                country_code: userEmail.country_code,
                                phone: userEmail.phone,
                                image: userEmail.image ? userEmail.image : "",
                            },
                            "error": "0"
                        }
                    });

                    //return res.json({ "data": { "success": 1, "message": "Account successfully verified. Welcome to our Car-Service App..!!", "error": 0 } });
                }
            }
            else {
                return res.json({ "data": { "success": 0, "message": "OTP Mismatch: Please check the OTP and try again..!!*", "error": 1 } });
            }
        }
        else {
            return res.json({ "data": { "success": 0, "message": "Sorry, we couldn't find your email in our records. Please double-check and try again..!!*", "error": 1 } });
        }
    }

    catch (error) {
        return res.json({
            "data": { "success": 0, "message": error, "error": 1 }
        });
    }
}

// User SignIn
// module.exports.SignIn = async (req, res) => {
//     try {
//         const email = req.body.email;
//         const password = sha256.x2(req.body.password);
//         const UserData = await User.findOne({ email: email, is_verified: 1, active: true });
//         if (UserData) {
//             if (UserData.password == password) {
//                 const token = jwt.sign({ id: UserData._id }, process.env.SESSION_SECREAT);
//                 return res.json({
//                     "data": {
//                         "success": 1,
//                         message: "Successfully Logged User !!",
//                         token: token,
//                         userDetails: {
//                             id: UserData._id,
//                             firstname: UserData.firstname,
//                             lastname: UserData.lastname,
//                             username: UserData.username,
//                             email: UserData.email,
//                             phone: UserData.phone,
//                             image: UserData.image ? UserData.image : ""

//                         },
//                         "error": 0
//                     }
//                 });

//             }
//             else {

//                 return res.json({ "data": { "success": 0, "message": "Email and Passowrd not correct", "error": 1 } });
//             }
//         }
//         else {

//             return res.json({ "data": { "success": 0, "message": "Your Account is Deactivated By Admin...Please Try to Signup and Verify OTP", "error": 1 } });
//         }
//     }

//     catch (error) {
//         return res.json(error.message);
//     }
// }

// User SignIn
module.exports.SignIn = async (req, res) => {
    try {
        const email = req.body.email;
        const password = sha256.x2(req.body.password);

        const UserData = await User.findOne({ email: email });

        if (UserData) {
            if (UserData.active === true) {
                if (UserData.password == password) {
                    const deviceId = req.body.deviceId;

                    let findUserDevice = await Notification.findOne({
                        userId: UserData._id,
                        deviceId: deviceId
                    });

                    if (!findUserDevice) {
                        const newDevice = new Notification({
                            userId: UserData._id,
                            deviceId: deviceId,
                            is_active: 1
                        });

                        await newDevice.save();
                    }

                    const token = jwt.sign({ id: UserData._id }, process.env.SESSION_SECREAT);

                    return res.json({
                        "data": {
                            "success": 1,
                            message: "Successfully logged user..!!",
                            token: token,
                            userDetails: {
                                id: UserData._id,
                                firstname: UserData.firstname,
                                lastname: UserData.lastname,
                                username: UserData.username,
                                email: UserData.email,
                                country_code: UserData.country_code,
                                phone: UserData.phone,
                                image: UserData.image ? UserData.image : "",
                            },
                            "error": "0"
                        }
                    });
                } else {
                    return res.json({ "data": { "success": 0, "message": "Email and Password not correct..!!*", "error": 1 } });
                }
            } else {
                return res.json({ "data": { "success": 0, "message": "Your account has been deactivated by the admin.", "error": 1 } });
            }
        } else {
            return res.json({ "data": { "success": 0, "message": "Please Create an Account and Verify OTP..!!*", "error": 1 } });
        }
    } catch (error) {
        console.error(error);
        return res.json({ "data": { "success": 0, "message": "Error occurred. Please try again..!!*", "error": 1 } });
    }
};


// Verify User
module.exports.VerifyUser = async (req, res) => {
    try {
        const email = req.body.email;
        const user = await User.findOne({ email: email });
        if (user) {
            if (user.is_verified == 1) {

                return res.json({ "data": { "success": 1, "message": "User is verified..!!", "error": 0 } });
            }
            else {

                // return res.json({ "data": { "success": 0, "message": "User is not verified..Check for OTP Verification..!!*", "error": 1 } });
            }
        } else {
            return res.json({ "data": { "success": 0, "message": "User not found..!!*", "error": 1 } });
        }
    }
    catch (error) {
        console.log(error.message);
    }
}

// Resend OTP
module.exports.ResendOTP = async (req, res) => {
    try {
        const email = req.body.email;
        const user = await User.findOne({ email: email });
        if (user) {
            // Generate OTP
            let OTP = otpgenerator.generate(4, { lowerCaseAlphabets: false, upperCaseAlphabets: false, specialChars: false });

            // Send OTP
            SendOTP(user.firstname, user.email, OTP);

            // Delete past OTP record
            const delPastRecord = await UserOTP.deleteOne({ email: user.email });

            // Save new OTP
            const otpMail = await UserOTP.create({
                email: user.email,
                OTP: OTP
            });

            return res.json({ "data": { "success": 1, "message": "OTP sent successfully..!!", "error": 0 } });
        } else {
            return res.json({ "data": { "success": 0, "message": "User not found..!!*", "error": 1 } });
        }
    } catch (error) {
        console.log(error.message);
    }
}

// Delete User
module.exports.DeleteUser = async (req, res) => {
    try {
        // Find the user by id
        const user = await User.findOne({ _id: req.body.userId });

        // Check if the user exists
        if (user) {

            // Delete the user's vehicle data
            let filterVehicle = { userId: user._id };
            const VehicleData = await UserVehicle.deleteMany(filterVehicle).populate({ path: 'UserVehicle' });

            // Delete the user's Address data
            let filterAddress = { userId: user._id };
            const AddressData = await UserAddress.deleteMany(filterAddress).populate({ path: 'UserAddress' });

            // Delete the user's voupon usage
            let filterCoupon = { userId: user._id };
            const CouponData = await UserCoupon.deleteMany(filterCoupon).populate({ path: 'UserCoupon' });

            // Delete the user's booking data
            //let filterBooking = { userId: user._id };
            //const BookingData = await VehicleBooking.deleteMany(filterBooking).populate({ path: 'VehicleBooking' });

            // Delete the user's slot booking data
            let filterSlotBooking = { userId: user._id };
            const SlotBookingData = await SlotBooking.deleteMany(filterSlotBooking).populate({ path: 'SlotBooking' });

            // Delete the user's review data
            let filterReview = { userId: user._id };
            const ReviewData = await PackageReview.deleteMany(filterReview).populate({ path: 'PackageReview' });

            // Delete the user's notification data
            let filterNotification = { userId: user._id };
            const NotificationData = await Notification.deleteMany(filterNotification).populate({ path: 'Notification' });

            // Delete the user's account
            const delUser = await User.deleteOne({ _id: user._id });

            if (filterNotification || filterVehicle || filterAddress || filterCoupon || filterSlotBooking || filterReview || delUser) {
                res.json({ "data": { "success": 1, "message": "User Account has been deleted...!!", "error": 0 } });
            }
            else {
                return res.json({ "data": { "success": 0, "message": "User Account has not been deleted...!!*", "error": 1 } });
            }
        }
    } catch (error) {
        return res.json({ "success": 0, "message": "User not found...!!" });
    }
}

// Signout
module.exports.signOut = async (req, res) => {
    try {
        const userId = req.body.userId;
        const deviceId = req.body.deviceId;
        const filter = { userId: userId, deviceId: deviceId };

        // Update the user's device status
        const updateDevice = await Notification.updateOne(filter, { $set: { is_active: false } });

        if (updateDevice) {
            res.json({ "data": { "success": 1, "message": "Signout Successfully..!!", "error": 0 } });
        } else {
            return res.json({ "data": { "success": 0, "message": "User not found..!!*", "error": 1 } });
        }

    } catch (error) {
        return res.json({ "data": { "success": 0, "message": "Signout failed..!!*", "error": 1 } });
    }
}

// Forgot Password OTP
const ForgotPasswordOTP = async (name, email, OTP2) => {
    try {
        const smtp = await SMTP.findOne({});
        const transporter = nodemailer.createTransport({
            host: smtp.host,
            port: smtp.port,
            secure: false,
            requireTLS: true,
            auth: {
                user: smtp.email,
                pass: smtp.password
            }
        });

        const handlebarOptions = {
            viewEngine: {
                partialsDir: path.resolve('./views/mail-templates/user-auth/'),
                defaultLayout: false,
            },
            viewPath: path.resolve('./views/mail-templates/user-auth'),
        };

        // use a template file with nodemailer
        transporter.use('compile', hbs(handlebarOptions));

        // Define the path to your image file
        const imgPath = path.resolve('./public/assets/media/logos/logo.png');

        // Attach the image to the email
        const attachment = {
            filename: 'logo.png',
            path: imgPath,
            cid: 'unique@nodemailer.com' // use cid as the URL in the img src
        };

        const mailoptions = {
            from: smtp.email,
            template: "forgotOTP",
            to: email,
            subject: 'Forgot Password Verification',
            context: {
                imgUrl: "assets/media/logos/logo.png",
                name: name,
                OTP: OTP2
            },
            attachments: [attachment]
        }
        transporter.sendMail(mailoptions, function (error, info) {
            if (error) {
                console.warn(error);
            }
            else {
                console.log("message has been sent", info.response);

            }
        })

    } catch (error) {
        console.warn(error);
    }
}

// Forgot Password
module.exports.ForgotPassword = async (req, res) => {
    try {
        // Find the user by email
        const email = req.body.email;

        // Find the user by email
        const EmailInfo = await User.findOne({ email: email });

        // Check if the user exists
        if (EmailInfo) {

            // Generate a new OTP
            let OTP2 = otpgenerator.generate(4, { lowerCaseAlphabets: false, upperCaseAlphabets: false, specialChars: false });

            // Send the OTP to the user's email
            ForgotPasswordOTP(EmailInfo.firstname, EmailInfo.email, OTP2);

            // Delete the previous OTP record
            const delPastRecord = await PasswordOTP.deleteOne({ email: EmailInfo.email });

            // Create a new OTP record
            const OTPMail = await PasswordOTP.create({
                email: EmailInfo.email,
                OTP: OTP2
            });

            return res.json({ "data": { "success": 1, "message": "Please check your email for OTP..!!", "error": 0 } });

        }
        else {
            return res.json({ "data": { "success": 0, "message": "Email not matched..!!*", "error": 1 } });
        }

    } catch (error) {
        console.log(error.message);
    }
}

// Reset Password Verification
module.exports.ResetPasswordVerification = async (req, res) => {
    try {
        // Find the user by email
        const email = req.body.email;
        const findUser = await PasswordOTP.findOne({ email: email });

        // Check if the user exists
        if (findUser) {

            // Check if the OTP matches
            if (findUser.OTP == req.body.otp) {

                // Update the user's verification status
                const userEmail = await PasswordOTP.findOneAndUpdate({ email: email }, { $set: { is_verified: 1 } });

                // Check if the user is verified
                if (userEmail.is_verified == 1) {

                    return res.json({ "data": { "success": 0, "message": "OTP not matched..try again..!!*", "error": 1 } });
                }
                else {
                    return res.json({ "data": { "success": 1, "message": "User verified successfully, Please set new password..!!", "error": 0 } });
                }
            }
            else {
                return res.json({ "data": { "success": 0, "message": "OTP not matched..try again..!!*", "error": 1 } });
            }
        }
        else {
            return res.json({ "data": { "success": 0, "message": "OTP expired...Try again for password reset", "error": 1 } });
        }
    }
    catch (error) {
        return res.json({ "data": { "success": 0, "message": error, "error": 1 } });
    }
}

// Reset Password
module.exports.ResetPassword = async (req, res) => {
    try {
        const email = req.body.email;
        const newpassword = req.body.newpassword;

        // Find the user by email
        const findEmail = await PasswordOTP.findOne({ email: email, is_verified: 1 });

        // Check if the user exists
        if (findEmail) {

            const EmailInfo = await User.findOne({ email: email });

            // Check if the user exists
            if (EmailInfo) {

                // hash the password
                const pass = sha256.x2(newpassword);

                // Update the user's password
                const SavePass = await User.findOneAndUpdate({ email: email }, { $set: { password: pass } });

                // Check if the password is updated
                if (SavePass) {

                    // Delete the matched OTP record
                    const DelMatched = await PasswordOTP.deleteOne({ email: SavePass.email });

                    return res.json({ "data": { "success": 1, "message": "Password Changed Successfully..!!", "error": 0 } });
                }
                else {
                    return res.json({ "data": { "success": 0, "message": "Reset password failed..!!*", "error": 1 } });
                }
            }
            else {
                return res.json({ "data": { "success": 0, "message": "email not found..!!*", "error": 1 } });
            }
        }
        else {

            return res.json({ "data": { "success": 0, "message": "OTP expired...Try again for password reset..!!*", "error": 1 } });
        }
    }
    catch (error) {
        console.log(error.message);
    }

}

// Get User Profile
module.exports.GetUser = async (req, res) => {
    try {
        // Find the user by id
        const user = await User.findOne({ _id: req.body.userId });

        if (user) {
            res.json({
                "data": {
                    "success": 1, "message": "User found Successfully...!!",
                    user: {
                        id: user._id,
                        firstname: user.firstname,
                        lastname: user.lastname,
                        username: user.username,
                        email: user.email,
                        country_code: user.country_code,
                        phone: user.phone,
                        image: user.image ? user.image : ""

                    },
                    "error": 0
                }

            })
        }
        else {
            return res.status(404).json({ "data": { "success": 0, "message": "User not found..!!*", "error": 1 } });
        }

    } catch (error) {
        console.log(error.message);
    }
}

// Upload Image
module.exports.UploadImage = async (req, res) => {
    try {
        const image = req.file.filename;
        res.json({ "data": { "success": 1, "message": "Image upload successfully..!!", image: image, "error": 0 } });

    } catch (error) {
        console.log(error.message);
    }
}

// Edit User Profile
module.exports.EditUser = async (req, res) => {
    try {
        // Find the user by id
        const id = req.body.id;

        // Update the user's profile
        const editUser = await User.findByIdAndUpdate(id,
            {
                firstname: req.body.firstname,
                lastname: req.body.lastname,
                country_code: req.body.country_code,
                phone: req.body.phone,
                image: req.body.image
            });

        if (editUser) {
            return res.json({ "data": { "success": 1, "message": "User updated successfully..!!", "error": 0 } });
        }
        else {
            return res.json({ "data": { "success": 0, "message": "User not updated..!!*", "error": 1 } });
        }
    }

    catch (error) {
        console.log(error.message);
    }
}

// Change Password
module.exports.ChangePassword = async (req, res) => {
    try {
        // Find the user by email
        const email = req.body.email;

        // hash the password
        const pass = sha256.x2(req.body.password);

        // Update the user's password
        const changePass = await User.findOneAndUpdate({ email: email }, { $set: { password: pass } });

        if (changePass) {
            return res.json({ "data": { "success": 1, "message": "Password changed successfully..!!", "error": 0 } });
        }
        else {
            return res.json({ "data": { "success": 0, "message": "Password not changed..!!*", "error": 1 } });
        }
    }
    catch (error) {
        console.log(error.message);
    }
}

// Get Currency
module.exports.GetCurrency = async (req, res) => {
    try {
        // Fetch all currency
        let getCurrency = await Currency.find();

        // Check if currency are found
        if (getCurrency.length > 0) {

            const currencyData = getCurrency.map(currency => ({
                "_id": currency._id,
                "currency": currency.currency,

            }));
            return res.json({ "data": { "success": 1, "message": "Currency found Successfully..!!", currencydetails: currencyData, "error": 0 } });
        }
        else {
            return res.json({ "data": { "success": 0, "message": "Currency not found !!*", "error": 1 } });
        }

    } catch (error) {
        return res.json({ "data": { "success": 0, "message": "Currency not found !!*", "error": 1 } });
    }
}

// Add User Address
module.exports.AddAddress = async (req, res) => {
    try {
        // check if address already exsist
        const findAddress = await UserAddress.findOne({ userId: req.body.userId });
        const addressData = new UserAddress({
            userId: req.body.userId,
            type: req.body.type,
            street: req.body.street,
            city: req.body.city,
            state: req.body.state,
            zipcode: req.body.zipcode,
            country: req.body.country,
            is_default: findAddress ? false : true
        });
        const saveAddress = await addressData.save();
        if (saveAddress) {
            return res.json({ "data": { "success": 1, "message": "Address added successfully..!!", "error": 0 } });
        }
        else {
            return res.json({ "data": { "success": 0, "message": "Address not added..!!*", "error": 1 } });
        }
    }
    catch (error) {
        console.log(error.message);
    }
}

// Edit User Address
module.exports.EditAddress = async (req, res) => {
    try {
        const addressId = req.body.addressId;
        const addressData = await UserAddress.findOne({ _id: addressId, userId: req.body.userId });
        if (addressData) {
            const updateAddress = await UserAddress.findOneAndUpdate({ _id: addressId, userId: req.body.userId }, { $set: { type: req.body.type, street: req.body.street, city: req.body.city, state: req.body.state, zipcode: req.body.zipcode, country: req.body.country } });
            if (updateAddress) {
                return res.json({ "data": { "success": 1, "message": "Your Address Updated successfully..!!", "error": 0 } });
            }
            else {
                return res.json({ "data": { "success": 0, "message": "Your Address Not Updated..!!*", "error": 1 } });
            }
        }
        else {
            return res.json({ "data": { "success": 0, "message": "Address not found..!!*", "error": 1 } });
        }
    }
    catch (error) {
        console.log(error);
    }
}

// Delete User Address
module.exports.DeleteAddress = async (req, res) => {
    try {
        const addressId = req.body.addressId;
        const userId = req.body.userId;

        // Check if address exists
        const addressData = await UserAddress.findOne({ _id: addressId, userId: userId });
        if (addressData) {
            const delAddress = await UserAddress.deleteOne({ _id: addressId, userId: userId });
            if (delAddress) {
                return res.json({ "data": { "success": 1, "message": "Address deleted successfully..!!", "error": 0 } });
            }
            else {
                return res.json({ "data": { "success": 0, "message": "Address not deleted..!!*", "error": 1 } });
            }
        }
        else {
            return res.json({ "data": { "success": 0, "message": "Address not found..!!*", "error": 1 } });
        }
    }
    catch (error) {
        console.log(error);
    }
}

// Set Default Address
module.exports.SetDefaultAddress = async (req, res) => {
    try {
        const userId = req.body.userId;
        const addressId = req.body.addressId;
        const AddressData = await UserAddress.findOne({ _id: addressId, userId: userId, is_default: true });
        if (AddressData) {
            return res.json({ "data": { "success": 0, "message": "Address already set as default..!!*", "error": 1 } });
        } else {
            const updateAddress = await UserAddress.updateMany({ userId: userId }, { $set: { is_default: false } });
            const setDefault = await UserAddress.findOneAndUpdate({ _id: addressId, userId: userId }, { $set: { is_default: true } });
            if (setDefault) {
                return res.json({ "data": { "success": 1, "message": "Address Set as Default successfully..!!", "error": 0 } });
            }
            else {
                return res.json({ "data": { "success": 0, "message": "Address Not Set as Default..!!*", "error": 1 } });
            }
        }

    } catch (error) {
        console.log(error);
    }
}

// Get User Address
module.exports.GetAddress = async (req, res) => {
    try {
        const userId = req.body.userId;
        const address = await UserAddress.find({ userId: userId });
        if (address) {
            // Sort address so that those with is_default: 1 come first
            address.sort((a, b) => b.is_default - a.is_default);
            const addressData = address.map(address => ({
                "id": address._id,
                "type": address.type,
                "street": address.street,
                "city": address.city,
                "state": address.state,
                "zipcode": address.zipcode,
                "country": address.country,
                "is_default": address.is_default
            }));
            return res.json({ "data": { "success": 1, "message": "Address found successfully..!!", addressDetails: addressData, "error": 0 } });
        }
        else {
            return res.json({ "data": { "success": 0, "message": "Address not found..!!*", "error": 1 } });
        }
    }
    catch (error) {
        console.log(error.message);
    }
}

function newFunction(req) {
    const page = parseInt(req.body.page || req.query.page) || 1;
    const limit = parseInt(req.body.limit || req.query.limit) || 4;
    const skip = (page - 1) * limit;
    return { limit, skip, page };
}

// Get Intro
module.exports.GetIntro = async (req, res) => {
    try {
        // Fetch active intros
        let intros = await Intro.find({ is_active: 1 });
        // Check if intros are found
        if (intros.length > 0) {
            const introsData = intros.map(intro => ({
                "_id": intro._id,
                "title": intro.title,
                "image": intro.image,
                "description": removeNonBreakingSpaces(removeAttributes(intro.description.replace(/\\/g, '')))
            }));

            res.json({ "data": { "success": 1, "message": "Intro found successfully...!!", introDetails: introsData, "error": 0 } });
        }
        else {
            return res.json({ "data": { "success": 0, "message": "Intro not found...!!*", "error": 1 } });
        }

    } catch (error) {
        console.log(error);
    }
}

// Get Time Slot
module.exports.GetTimeSlot = async (req, res) => {
    try {
        const timeSlots = await TimeSlot.findOne({});
        const timeSlotData = { "id": timeSlots._id, "slot_duration": timeSlots.slot_duration, "working_days": timeSlots.working_days, "timings": timeSlots.timings, "week_off_days": timeSlots.week_off_days };
        if (timeSlots) {
            res.json({ "data": { "success": 1, "message": "Time Slot found successfully...!!", timeSlotDetails: timeSlotData, "error": 0 } });
        } else {
            return res.json({ "data": { "success": 0, "message": "Time Slot not found...!!*", "error": 1 } });
        }
    } catch (error) {
        console.log(error);
    }
}

// Get Vehicle Type
module.exports.GetVehicleType = async (req, res) => {
    try {
        const vehicles = await VehicleType.find({ is_active: 1 });
        if (vehicles) {
            const vehicleData = vehicles.map(vehicle => ({
                "id": vehicle._id,
                "vehicle_type": vehicle.vehicle_type,
                "image": vehicle.image
            }));
            if (vehicleData) {
                res.json({ "data": { "success": 1, "message": "Vehicle Type found successfully...!!", vehicleDetails: vehicleData, "error": 0 } });
            } else {
                return res.json({ "data": { "success": 0, "message": "Vehicle Type not found...!!*", "error": 1 } });
            }
        }
    } catch (error) {
        console.log(error);
    }
}

// Get Service
module.exports.GetService = async (req, res) => {
    try {
        const services = await Service.find({ is_active: 1 });
        if (services) {
            const serviceData = services.map(service => ({
                "id": service._id,
                "name": service.name,
                "image": service.image
            }));
            if (serviceData) {
                res.json({ "data": { "success": 1, "message": "Service found successfully...!!", serviceDetails: serviceData, "error": 0 } });
            } else {
                return res.json({ "data": { "success": 0, "message": "Service not found...!!*", "error": 1 } });
            }
        }
    } catch (error) {
        console.log(error);
    }
}

// Search Package
module.exports.SearchPackage = async (req, res) => {
    try {
        const search = req.body.search;
        const packages = await Package.find({ title: { $regex: search, $options: 'i' }, is_active: 1 }).populate('serviceId', 'name image');
        if (packages) {
            const packageData = packages.map(package => ({
                "id": package._id,
                "title": package.title,
                "image": package.image,
                "price": package.price,
                "description": removeNonBreakingSpaces(removeAttributes(package.description.replace(/\\/g, ''))),
                "serviceDetails": package.serviceId,
            }));
            if (packageData) {
                res.json({ "data": { "success": 1, "message": "Package found successfully...!!", PackageDetails: packageData, "error": 0 } });
            } else {
                return res.json({ "data": { "success": 0, "message": "Package not found...!!*", "error": 1 } });
            }
        }
    } catch (error) {
        console.log(error);
    }
}

const shuffleArray = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
};

// Remove HTML Attributes
const removeAttributes = (html) => {
    return html.replace(/<(\w+)(\s[^>]*)?>/g, '<$1>');
};

// Remove Non-Breaking Spaces
const removeNonBreakingSpaces = (html) => {
    return html.replace(/&nbsp;/g, '');  // Remove &nbsp;
};

// Remove Empty Tags
// const removeEmptyTags = (html) => {
//     return html.replace(/<(\w+)><\/\1>/g, '');  // Remove empty tags
// };

// Get All Packages (Randomly)
module.exports.GetAllPackages = async (req, res) => {
    try {
        const packages = await Package.find({ is_active: 1 }).populate('serviceId', 'name image');
        if (packages.length > 0) {

            // Shuffle the packages array
            shuffleArray(packages);

            // calculate ratings of each package
            for (let i = 0; i < packages.length; i++) {
                let packageId = packages[i]._id;
                let reviews = await PackageReview.find({ packageId: packageId });
                let totalRating = 0;
                for (let j = 0; j < reviews.length; j++) {
                    totalRating += reviews[j].rating;
                }
                let avgRating = totalRating / reviews.length;
                packages[i].rating = avgRating;
            }

            // add 0 rating to packages without reviews
            for (let i = 0; i < packages.length; i++) {
                if (!packages[i].rating) {
                    packages[i].rating = 0;
                }
            }

            // Sort packages by rating
            packages.sort((a, b) => (a.rating < b.rating) ? 1 : -1);

            // add ratings to each package
            const packagesData = packages.map(package => ({
                "id": package._id,
                "title": package.title,
                "image": package.image,
                "price": package.price,
                //"description": package.description,
                "description": removeNonBreakingSpaces(removeAttributes(package.description.replace(/\\/g, ''))),
                "serviceDetails": package.serviceId,
                "averagerating": Number(package.rating.toFixed(1))
            }));
            res.json({ "data": { "success": 1, "message": "Packages found successfully...!!", packageDetails: packagesData, "error": 0 } });
        } else {
            return res.json({ "data": { "success": 0, "message": "Packages not found...!!*", "error": 1 } });
        }

    } catch (error) {
        console.log(error);
    }
}

// Get Packages By Service
module.exports.GetPackage = async (req, res) => {
    try {
        const packages = await Package.find({ serviceId: req.body.serviceId, is_active: 1 }).populate('serviceId', 'name image');
        if (packages.length > 0) {

            // calculate ratings of each package
            for (let i = 0; i < packages.length; i++) {
                let packageId = packages[i]._id;
                let reviews = await PackageReview.find({ packageId: packageId });
                let totalRating = 0;
                for (let j = 0; j < reviews.length; j++) {
                    totalRating += reviews[j].rating;
                }
                let avgRating = totalRating / reviews.length;
                packages[i].rating = avgRating;
            }

            // add 0 rating to packages without reviews
            for (let i = 0; i < packages.length; i++) {
                if (!packages[i].rating) {
                    packages[i].rating = 0;
                }
            }

            // Sort packages by rating
            packages.sort((a, b) => (a.rating < b.rating) ? 1 : -1);

            // add ratings to each package
            const packagesData = packages.map(package => ({
                "id": package._id,
                "title": package.title,
                "image": package.image,
                "price": package.price,
                "description": removeNonBreakingSpaces(removeAttributes(package.description.replace(/\\/g, ''))),
                "serviceDetails": package.serviceId,
                "averagerating": Number(package.rating.toFixed(1))
            }));
            res.json({ "data": { "success": 1, "message": "Packages found successfully...!!", packageDetails: packagesData, "error": 0 } });
        } else {
            return res.json({ "data": { "success": 0, "message": "Packages not found...!!*", "error": 1 } });
        }

    } catch (error) {
        console.log(error);
    }
}

// Get Package Details
module.exports.GetPackageDetails = async (req, res) => {
    try {
        const packageId = req.body.packageId;
        const packages = await Package.find({ _id: packageId }).populate('serviceId', 'name image');

        // fetch reviews of the package
        const reviews = await PackageReview.find({ packageId: packageId }).populate('userId', 'name image');
        totalRating = 0;
        for (let i = 0; i < reviews.length; i++) {
            totalRating += reviews[i].rating;
        }
        totalRating = Number((totalRating / reviews.length).toFixed(1));

        // add 0 rating to packages without reviews
        if (!totalRating) {
            totalRating = 0;
        }

        if (packages) {
            const packageData = packages.map(package => ({
                "id": package._id,
                "title": package.title,
                "image": package.image,
                "price": package.price,
                // fetch DESCRIPTION USING entities
                //"description":  replaceEscapedQuotes(package.description),
                "description": removeNonBreakingSpaces(removeAttributes(package.description.replace(/\\/g, ''))),
                "serviceDetails": package.serviceId,
                "gallery_images": package.gallery_images,
                "averagerating": totalRating
            }));

            if (packageData) {
                res.json({ "data": { "success": 1, "message": "Package found successfully...!!", packageDetails: packageData, "error": 0 } });
            } else {
                return res.json({ "data": { "success": 0, "message": "Package not found...!!*", "error": 1 } });
            }
        }
    }
    catch (error) {
        console.log(error);
    }
}

// Get Banner
module.exports.GetBanner = async (req, res) => {
    try {
        // Fetch active banner
        let banners = await Banner.find({ is_active: 1 }).populate('serviceId', 'name image');
        // Check if banner are found
        if (banners.length > 0) {
            const bannerData = banners.map(banner => ({
                "_id": banner._id,
                "title": banner.title,
                "image": banner.image,
                "serviceId": banner.serviceId,
            }));
            res.json({ "data": { "success": 1, "message": "Banner found successfully...!!", bannerDetails: bannerData, "error": 0 } });
        }
        else {
            return res.json({ "data": { "success": 0, "message": "Banner not found...!!*", "error": 1 } });
        }
    } catch (error) {
        console.log(error);
    }
}

// // Get Banner By Center
module.exports.GetBannerByService = async (req, res) => {
    try {
        const serviceId = req.body.serviceId;
        const banners = await Banner.find({ serviceId: serviceId, is_active: 1 }).populate('serviceId', 'name image');

        // Check if banner are found
        if (banners.length > 0) {
            const bannerData = banners.map(banner => ({
                "_id": banner._id,
                "title": banner.title,
                "image": banner.image,
                "serviceId": banner.serviceId,
            }));

            res.json({ "data": { "success": 1, "message": "Banner found successfully...!!", bannerDetails: bannerData, "error": 0 } });
        }
        else {
            return res.json({ "data": { "success": 0, "message": "Banner not found...!!*", "error": 1 } });
        }

    }
    catch (error) {
        console.log(error);
    }
}

// Add Vehicle
module.exports.AddVehicle = async (req, res) => {
    try {
        // Check if vehicle already exist
        const vehicleExist = await UserVehicle.findOne({ vehicle_number: req.body.vehicle_number });
        if (vehicleExist) {
            return res.json({ "data": { "success": 0, "message": "Vehicle already exist..!!*", "error": 1 } });
        } else {
            // find Previous default vehicle
            const defaultVehicle = await UserVehicle.findOne({ userId: req.body.userId });
            const vehicleData = new UserVehicle({
                userId: req.body.userId,
                vehicle_name: req.body.vehicle_name,
                vehicle_number: req.body.vehicle_number,
                vehicleTypeId: req.body.vehicleTypeId,
                is_default: defaultVehicle ? false : true
            });
            const storeVehicle = await vehicleData.save();
            if (storeVehicle) {
                return res.json({ "data": { "success": 1, "message": "Your Vehicle Added successfully..!!", vehicleDetails: storeVehicle, "error": 0 } });
            }
            else {
                return res.json({ "data": { "success": 0, "message": "Your Vehicle Not Added..!!*", "error": 1 } });
            }
        }

    } catch (error) {
        console.log(error);
    }
}

// Edit Vehicle
module.exports.EditVehicle = async (req, res) => {
    try {
        const vehicleId = req.body.vehicleId;
        const vehicleData = await UserVehicle.findOne({ _id: vehicleId, userId: req.body.userId });
        if (vehicleData) {
            const updateVehicle = await UserVehicle.findOneAndUpdate({ _id: vehicleId, userId: req.body.userId }, { $set: { vehicle_name: req.body.vehicle_name, vehicle_number: req.body.vehicle_number, vehicleTypeId: req.body.vehicleTypeId } });
            if (updateVehicle) {
                return res.json({ "data": { "success": 1, "message": "Your Vehicle Updated successfully..!!", "error": 0 } });
            }
            else {
                return res.json({ "data": { "success": 0, "message": "Your Vehicle Not Updated..!!*", "error": 1 } });
            }
        }
        else {
            return res.json({ "data": { "success": 0, "message": "Vehicle not found..!!*", "error": 1 } });
        }
    }
    catch (error) {
        console.log(error);
    }
}

// Delete Vehicle
module.exports.DeleteVehicle = async (req, res) => {
    try {
        const vehicleId = req.body.vehicleId;
        const userId = req.body.userId;
        // Check if vehicle exist
        const vehicleExist = await UserVehicle.findOne({ _id: vehicleId, userId: userId });
        if (!vehicleExist) {
            return res.json({ "data": { "success": 0, "message": "Vehicle not found..!!*", "error": 1 } });
        } else {
            const delVehicle = await UserVehicle.deleteOne({ _id: vehicleId, userId: userId });
            if (delVehicle) {
                return res.json({ "data": { "success": 1, "message": "Your Vehicle Deleted successfully..!!", "error": 0 } });
            }
            else {
                return res.json({ "data": { "success": 0, "message": "Your Vehicle Not Deleted..!!*", "error": 1 } });
            }
        }
    } catch (error) {
        console.log(error);
    }
}

// Set Default Vehicle
module.exports.SetDefaultVehicle = async (req, res) => {
    try {
        const userId = req.body.userId;
        const vehicleId = req.body.vehicleId;
        const vehicle_number = req.body.vehicle_number;
        const vehicleData = await UserVehicle.findOne({ _id: vehicleId, userId: userId, vehicle_number: vehicle_number, is_default: true });
        if (vehicleData) {
            return res.json({ "data": { "success": 0, "message": "Vehicle already set as default..!!*", "error": 1 } });
        } else {
            const updateVehicle = await UserVehicle.updateMany({ userId: userId }, { $set: { is_default: false } });
            const setDefault = await UserVehicle.findOneAndUpdate({ _id: vehicleId, userId: userId, vehicle_number: vehicle_number }, { $set: { is_default: true } });
            if (setDefault) {
                return res.json({ "data": { "success": 1, "message": "Your Vehicle Set as Default successfully..!!", "error": 0 } });
            }
            else {
                return res.json({ "data": { "success": 0, "message": "Your Vehicle Not Set as Default..!!*", "error": 1 } });
            }
        }

    } catch (error) {
        console.log(error);
    }
}

// My Vehicle List
module.exports.VehicleList = async (req, res) => {
    try {
        const userId = req.body.userId;
        const vehicles = await UserVehicle.find({ userId: userId }).populate('vehicleTypeId', 'vehicle_type image');
        if (vehicles) {
            // Sort vehicles so that those with is_default: 1 come first
            vehicles.sort((a, b) => b.is_default - a.is_default);
            const vehicleData = vehicles.map(vehicle => ({
                "id": vehicle._id,
                "vehicle_name": vehicle.vehicle_name,
                "vehicle_number": vehicle.vehicle_number,
                "vehicleTypeDetails": vehicle.vehicleTypeId,
                "is_default": vehicle.is_default
            }));
            res.json({ "data": { "success": 1, "message": "Vehicle found successfully..!!", vehicleDetails: vehicleData, "error": 0 } });
        }
    } catch (error) {
        return res.json({ "data": { "success": 0, "message": "Vehicle not found..!!*", "error": 1 } });
    }
}

// Get Pages 
module.exports.GetPages = async (req, res) => {
    try {
        // Fetch all pages
        let pages = await Page.find();

        // Check if pages are found
        if (pages.length > 0) {

            // Process each page to return only required data
            const pagesData = pages.map(page => ({
                "_id": page._id,
                "privacy_policy": removeNonBreakingSpaces(removeAttributes(page.privacy_policy.replace(/\\/g, ''))),
                "terms_condition": removeNonBreakingSpaces(removeAttributes(page.terms_condition.replace(/\\/g, ''))),
                "about": removeNonBreakingSpaces(removeAttributes(page.about.replace(/\\/g, ''))),
                "help": removeNonBreakingSpaces(removeAttributes(page.help.replace(/\\/g, '')))
            }));

            res.json({ "data": { "success": 1, "message": "Pages found successfully...!!", pagesDetails: pagesData, "error": 0 } });
        }
        else {
            return res.json({ "data": { "success": 0, "message": "Pages not found...!!*", "error": 1 } });
        }

    } catch (error) {
        console.log(error);
    }
}
// Get Payment method
module.exports.PaymentMethod = async (req, res) => {
    try {
        const paymentMethods = await PaymentGateway.find({});
        if (paymentMethods) {
            const paymentData = paymentMethods.map(payment => ({
                "paypal": {
                    "paypal_is_enable": payment.paypal_is_enable,
                    "paypal_mode": payment.paypal_mode,
                    "paypal_merchant_Id": payment.paypal_mode == "testMode" ? payment.paypal_testmode_merchant_Id : payment.paypal_livemode_merchant_Id,
                    "paypal_tokenization_key": payment.paypal_mode == "testMode" ? payment.paypal_testmode_tokenization_key : payment.paypal_livemode_tokenization_key,
                    "paypal_public_key": payment.paypal_mode == "testMode" ? payment.paypal_testmode_public_key : payment.paypal_livemode_public_key,
                    "paypal_private_key": payment.paypal_mode == "testMode" ? payment.paypal_testmode_private_key : payment.paypal_livemode_private_key
                },
                "stripe": {
                    "stripe_is_enable": payment.stripe_is_enable,
                    "stripe_test_mode": payment.stripe_mode,
                    "stripe_publishable_key": payment.stripe_mode == "testMode" ? payment.stripe_testmode_publishable_key : payment.stripe_livemode_publishable_key,
                    "stripe_secret_key": payment.stripe_mode == "testMode" ? payment.stripe_testmode_secret_key : payment.stripe_livemode_secret_key
                },
                "razorpay": {
                    "razorpay_is_enable": payment.razorpay_is_enable,
                    "razorpay_mode": payment.razorpay_mode,
                    "razorpay_key_Id": payment.razorpay_mode == "testMode" ? payment.razorpay_testmode_key_Id : payment.razorpay_livemode_key_Id,
                    "razorpay_key_secret": payment.razorpay_mode == "testMode" ? payment.razorpay_testmode_key_secret : payment.razorpay_livemode_key_secret
                },
            }));
            res.json({ "data": { "success": 1, "message": "Payment Gateway found successfully..!!", paymentMethod: paymentData, "error": 0 } });
        }
        else {
            return res.json({ "data": { "success": 0, "message": "Payment Gateway not found..!!*", "error": 1 } });
        }
    } catch (error) {
        return res.json({ "data": { "success": 0, "message": "Payment Gateway not found..!!*", "error": 1 } });
    }
}

// Get Standard rates
module.exports.GetStandardRate = async (req, res) => {
    try {
        const rates = await StandardRate.find();
        if (rates) {
            const rateData = rates.map(rate => ({
                "id": rate._id,
                "tax_name": rate.tax_name,
                "country_code": rate.country_code,
                "tax_rate": rate.tax_rate
            }));
            res.json({ "data": { "success": 1, "message": "Standard Rates found successfully...!!", rateDetails: rateData, "error": 0 } });
        }
        else {
            return res.json({ "data": { "success": 0, "message": "Standard Rates not found...!!*", "error": 1 } });
        }
    } catch (error) {
        console.log(error);
    }
}

// Get Coupons
module.exports.GetCouponCode = async (req, res) => {
    try {
        const couponType = await Coupon.find();
        const currentDate = new Date();  // Get the current date

        if (couponType.length > 0) {

            // Helper function to parse date in dd-mm-yyyy format
            const parseDate = (dateStr) => {
                const [day, month, year] = dateStr.split('-');
                return new Date(year, month - 1, day);
            };
            const validCoupons = couponType.filter(coupon => parseDate(coupon.expiry_date) > currentDate);  // Filter out expired coupons

            if (validCoupons.length > 0) {
                const couponTypeData = validCoupons.map(coupon => ({
                    "_id": coupon._id,
                    "name": coupon.name,
                    "coupon_code": coupon.coupon_code,
                    "coupon_type": coupon.coupon_type,
                    "coupon_amount": coupon.coupon_amount,
                    "start_date": coupon.start_date,
                    "expiry_date": coupon.expiry_date,
                    "minimum_spend": coupon.minimum_spend,
                    "maximum_spend": coupon.maximum_spend,
                    "usage_limit_per_coupon": coupon.usage_limit_per_coupon,
                    "usage_limit_per_user": coupon.usage_limit_per_user,
                }));

                res.json({ "data": { "success": 1, "message": "Coupon found successfully...!!", couponDetails: couponTypeData, "error": 0 } });
            } else {
                res.json({ "data": { "success": 0, "message": "No valid coupons found...!!", "error": 1 } });
            }
        } else {
            return res.json({ "data": { "success": 0, "message": "Coupon not found...!!", "error": 1 } });
        }
    } catch (error) {
        return res.json({ "data": { "success": 0, "message": "An error occurred...!!", "error": 1 } });
    }
}

// module.exports.GetCouponCode = async (req, res) => {
//     try {
//         const couponType = await Coupon.find();
//         if (couponType.length > 0) {
//             const couponTypeData = couponType.map(coupon => ({
//                 "_id": coupon._id,
//                 "name": coupon.name,
//                 "coupon_code": coupon.coupon_code,
//                 "coupon_type": coupon.coupon_type,
//                 "coupon_amount": coupon.coupon_amount,
//                 "start_date": coupon.start_date,
//                 "expiry_date": coupon.expiry_date,
//                 "minimum_spend": coupon.minimum_spend,
//                 "maximum_spend": coupon.maximum_spend,
//                 "usage_limit_per_coupon": coupon.usage_limit_per_coupon,
//                 "usage_limit_per_user": coupon.usage_limit_per_user,
//             }));
//             res.json({ "data": { "success": 1, "message": "Coupon found successfully...!!", couponDetails: couponTypeData, "error": 0 } });
//         } else {
//             return res.json({ "data": { "success": 0, "message": "Coupon not found...!!*", "error": 1 } });
//         }
//     } catch (error) {
//         return res.json({ "data": { "success": 0, "message": "An error occurred...!!*", "error": 1 } });
//     }
// }

// Apply Coupon
// module.exports.ApplyCoupon = async (req, res) => {
//     try {
//         const couponCode = req.body.coupon_code;
//         const userId = req.body.userId;
//         // const couponUsage = await UserCoupon.findOne({ userId: userId, coupon_code: couponCode });
//         // if (couponCode && couponUsage) {
//         //     return res.json({ "data": { "success": 0, "message": "Coupon already used.", "error": 1 } });
//         // }
//         const findCoupon = await Coupon.findOne({ coupon_code: couponCode });
//         const currentDate = new Date();
//         if (findCoupon) {
//             const startDateParts = findCoupon.start_date.split('-').reverse();
//             const expiryDateParts = findCoupon.expiry_date.split('-').reverse();
//             const startDate = new Date(startDateParts.join('-'));
//             const expiryDate = new Date(expiryDateParts.join('-'));

//             if (currentDate >= startDate && currentDate <= expiryDate) {
//                 return res.json({ "data": { "success": 1, "message": "You can apply Coupon code...!!", "error": 0 } });
//             } else {
//                 return res.json({ "data": { "success": 0, "message": "Coupon is not yet valid or has expired...!!*", "error": 1 } });
//             }
//         } else {
//             return res.json({ "data": { "success": 0, "message": "Coupon code not found...!!*", "error": 1 } });
//         }
//     } catch (error) {
//         console.error("Error:", error);
//         return res.json({ "data": { "success": 0, "message": "An error occurred...!!*", "error": 1 } });
//     }
// }

module.exports.ApplyCoupon = async (req, res) => {
    try {
        const couponCode = req.body.coupon_code;
        const userId = req.body.userId;

        // Fetch the coupon by code
        const coupon = await Coupon.findOne({ coupon_code: couponCode });
        if (!coupon) {
            return res.json({ "data": { "success": 0, "message": "Coupon not found.", "error": 1 } });
        }

        // Check if the coupon is expired
        const currentDate = new Date();
        const [day, month, year] = coupon.expiry_date.split('-');
        const expiryDate = new Date(year, month - 1, day);

        if (expiryDate < currentDate) {
            return res.json({ "data": { "success": 0, "message": "Coupon has expired.", "error": 1 } });
        }

        // Check if the coupon has been used by the user
        const couponUsage = await UserCoupon.findOne({ userId: userId, coupon_code: couponCode });
        if (couponUsage) {
            return res.json({ "data": { "success": 0, "message": "Coupon already used.", "error": 1 } });
        } else {
            return res.json({ "data": { "success": 1, "message": "You can apply Coupon code...!!", "error": 0 } });
        }

    } catch (error) {
        console.error("Error:", error);
        return res.json({ "data": { "success": 0, "message": "An error occurred...!!*", "error": 1 } });
    }
}

// Get Avaialble Slots
module.exports.GetAvailableSlots = async (req, res) => {
    try {
        const { bookingDate } = req.body;

        // Convert the booking date from dd-mm-yyyy to yyyy-mm-dd
        const bookingDateTime = new Date(`${bookingDate.split('-').reverse().join('-')}T00:00:00`);

        const formattedBookingDate = `${(bookingDateTime.getMonth() + 1).toString().padStart(2, '0')}-${bookingDateTime.getDate().toString().padStart(2, '0')}-${bookingDateTime.getFullYear()}`;

        // Get the day of the week
        const dayNames = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
        const dayName = dayNames[bookingDateTime.getDay()];

        // Fetch center details to check week off days
        const center = await TimeSlot.findOne();
        const weekOffDays = center.week_off_days;

        // Check if the booking date is a week off
        if (weekOffDays.includes(dayName)) {
            return res.json({ "data": { "success": 0, "message": "Service is closed on this day.", "error": 1 } });
        }

        // Fetch center timings
        const centerTimings = center.timings;
        const [centerTimingStart, centerTimingEnd] = centerTimings.split(' - ').map(parseTime);

        // Fetch existing bookings for the day
        const slots = await SlotBooking.find({ bookingDate: formattedBookingDate });
        const bookedSlots = slots.map(slot => slot.bookingTime);

        // Generate available slots based on center timings
        const availableSlots = generateAvailableSlots(centerTimingStart, centerTimingEnd, bookedSlots);

        res.json({ "data": { "success": 1, "message": "Slots found successfully...!!", "availableSlots": availableSlots, "error": 0 } });
    } catch (error) {
        console.log(error);
        res.status(500).json({ "data": { "success": 0, "message": "Internal Server Error", "error": 1 } });
    }
    // Define your time parsing function outside to reuse it
    function parseTime(time) {
        const [timePart, modifier] = time.split(' ');
        let [hours, minutes] = timePart.split(':').map(Number);

        if (modifier === 'PM' && hours !== 12) {
            hours += 12;
        }
        if (modifier === 'AM' && hours === 12) {
            hours = 0;
        }

        return hours * 60 + minutes;
    }

    // Function to generate available slots based on center timings and booked slots
    function generateAvailableSlots(centerStart, centerEnd, bookedSlots) {
        const slots = [];
        let currentTime = centerStart;

        while (currentTime < centerEnd) {
            const endTime = currentTime + 60; // Assuming 1 hour slots
            const slotTime = `${formatTime(currentTime)} - ${formatTime(endTime)}`;
            const isBooked = bookedSlots.includes(formatTime(currentTime)) ? 1 : 0;

            slots.push({
                time: slotTime,
                booked: isBooked
            });

            currentTime = endTime;
        }

        return slots;
    }

    // Function to format time from minutes to HH:MM AM/PM
    function formatTime(minutes) {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        const ampm = hours >= 12 ? 'PM' : 'AM';
        const formattedHours = hours % 12 || 12;
        const formattedMinutes = mins.toString().padStart(2, '0');

        return `${formattedHours}:${formattedMinutes} ${ampm}`;
    }
}

// Book a vehicle Service
module.exports.BookVehicle = async (req, res) => {
    try {
        const { user, address, service, package, vehicle, bookingDate, bookingTime, price, paymentMode, transactionId, paymentStatus, orderStatus, subTotal, coupon_code, coupon_type, coupon_amount, VAT, Total } = req.body;

        // Check if the user has a default address
        const addressData = await UserAddress.findOne({ _id: address.addressId, userId: user.userId, is_default: true });
        if (!addressData) {
            return res.json({ "data": { "success": 0, "message": "Select Your Primary Address..", "error": 1 } });
        }
        // Check if the user has a default vehicle
        const vehicleData = await UserVehicle.findOne({ _id: vehicle.vehicleId, is_default: true });
        if (!vehicleData) {
            return res.json({ "data": { "success": 0, "message": "Select Your Primary Vehicle..", "error": 1 } });
        }
        // Check if the vehicle is already booked on the specified date
        // const findBooking = await VehicleBooking.findOne({ 
        //     'user.userId': user.userId , 
        //     'address.addressId': address.addressId, 
        //     'service.serviceId': service.serviceId, 
        //     'package.packageId': package.packageId, 
        //     'vehicle.vehicleId': vehicle.vehicleId, 
        //     bookingDate 
        // });


        // if (findBooking) {
        //     return res.json({ "data": { "success": 0, "message": "You already booked this service.", "error": 1 } });
        // }

        const couponUsage = await UserCoupon.findOne({ userId: user.userId, coupon_code });
        if (coupon_code && couponUsage) {
            return res.json({ "data": { "success": 0, "message": "Coupon already used.", "error": 1 } });
        }

        // const bookingDateTime = new Date(bookingDate);
        const bookingDateTime = new Date(`${bookingDate.split('-').reverse().join('-')}T00:00:00`);
        const formattedBookingDate = `${(bookingDateTime.getMonth() + 1).toString().padStart(2, '0')}-${bookingDateTime.getDate().toString().padStart(2, '0')}-${bookingDateTime.getFullYear()}`;
        const dayNames = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
        const dayName = dayNames[bookingDateTime.getDay()];
        console.log("dayName", dayName);

        // Check if the booking date is a week off
        const center = await TimeSlot.findOne();
        const weekOffDays = center.week_off_days;
        if (weekOffDays.includes(dayName)) {
            return res.json({ "data": { "success": 0, "message": "Service is closed on this day.", "error": 1 } });
        }
        console.log("weekOffDays", weekOffDays);

        // Check center timings for the booking time
        const centerTimings = center.timings;
        const [centerTimingStart, centerTimingEnd] = centerTimings.split(' - ').map(parseTime);
        const bookingTimeMinutes = parseTime(bookingTime);

        if (bookingTimeMinutes < centerTimingStart || bookingTimeMinutes > centerTimingEnd) {
            return res.json({ "data": { "success": 0, "message": "Center is closed at this time.", "error": 1 } });
        }

        // Check if the slot is already booked
        const bookedSlots = await SlotBooking.find({ bookingDate: formattedBookingDate, bookingTime });
        if (bookedSlots.length > 0) {
            return res.json({ "data": { "success": 0, "message": "Slot is already booked. Please try another slot.", "error": 1 } });
        }

        // Find the latest order count
        const latestOrder = await VehicleBooking.findOne({}, {}, { sort: { 'createdAt': -1 } });
        let orderId = 1;
        if (latestOrder && latestOrder.orderNo) {
            orderId = parseInt(latestOrder.orderNo) + 1;
        } else {
            console.log("No previous orders found. Creating new order with orderNo 1");
        }
        const paddedOrderId = orderId.toString().padStart(1, '0');

        // Proceed with booking the vehicle
        const bookedVehicle = new VehicleBooking({
            orderNo: paddedOrderId,
            user: {
                userId: user.userId,
                username: user.username,
                email: user.email,
            },
            address: {
                addressId: address.addressId,
                type: address.type,
                street: address.street,
                city: address.city,
                state: address.state,
                zipcode: address.zipcode,
                country: address.country
            },
            service: {
                serviceId: service.serviceId,
                name: service.name,
                image: service.image
            },
            package: {
                packageId: package.packageId,
                title: package.title,
                image: package.image,
                price: package.price
            },
            vehicle: {
                vehicleId: vehicle.vehicleId,
                vehicle_name: vehicle.vehicle_name,
                vehicle_number: vehicle.vehicle_number
            },
            bookingDate,
            bookingTime,
            price,
            paymentMode,
            transactionId,
            paymentStatus,
            orderStatus,
            subTotal,
            coupon_code,
            coupon_type,
            coupon_amount,
            VAT,
            Total
        });

        // Save the booking details
        const saveBooking = await bookedVehicle.save();
        if (saveBooking) {

            // Save the slot booking details
            const bookedSlot = new SlotBooking({ userId: user.userId, vehicle, service, bookingId: saveBooking._id, bookingDate: formattedBookingDate, bookingTime });
            const saveSlot = await bookedSlot.save();

            // Save the coupon usage details
            if (coupon_code) {
                const couponUsage = new UserCoupon({ userId: user.userId, coupon_code });
                const saveCouponUsage = await couponUsage.save();
            }

            // Send push notification to the user's device
            const serverKey = process.env.SERVER_KEY;
            const registrationToken = req.body.registrationToken;
            const title = "Order Pending Confirmation";
            const body = "Your Vehicle service order is awaiting confirmation from the service provider. You will be notified once the status changes.";

            sendPushNotification(serverKey, registrationToken, title, body, function (err, response) {
                if (err) {
                    console.error("Failed to send push notification:" + registrationToken, err);
                } else {
                    console.log("Push notification sent successfully:" + registrationToken, response);
                }
            });

            if (saveSlot) {
                return res.json({ "data": { "success": 1, "message": "Vehicle Service Booked successfully.", "error": 0 } });
            }
        }

        res.json({ "data": { "success": 0, "message": "Vehicle Service Booking Failed.", "error": 1 } });

    } catch (error) {
        console.error(error);
        res.status(500).json({ "data": { "success": 0, "message": "An error occurred during booking.", "error": 1 } });
    }

    // Function to parse time strings
    function parseTime(timeString) {
        const [time, period] = timeString.split(' ');
        let [hours, minutes] = time.split(':').map(Number);
        if (period === 'PM' && hours !== 12) hours += 12;
        if (period === 'AM' && hours === 12) hours = 0;
        return hours * 60 + minutes;
    }
}

// Get Booked Vehicle
module.exports.GetBookingDetails = async (req, res) => {
    try {
        const userId = req.body.userId;
        const showBooking = await VehicleBooking.find({ "user.userId": userId });

        if (showBooking.length > 0) {
            // Find the default vehicle for the user and populate the vehicle type details
            const findVehicle = await UserVehicle.find({ userId: userId }).populate('vehicleTypeId', 'vehicle_type image');

            const BookingDetails = showBooking.map(booking => {
                // Find the corresponding vehicle details from findVehicle
                const vehicleDetail = findVehicle.find(vehicle => vehicle._id.equals(booking.vehicle.vehicleId));

                // Customize the vehicleDetails object
                const vehicleDetails = vehicleDetail ? {
                    _id: vehicleDetail._id,
                    vehicle_name: vehicleDetail.vehicle_name,
                    vehicle_number: vehicleDetail.vehicle_number,
                    vehicleTypeId: vehicleDetail.vehicleTypeId
                } : null;

                return {
                    "id": booking._id,
                    "orderNo": booking.orderNo,
                    "userDetails": booking.user,
                    "addressDetails": booking.address,
                    "vehicleDetails": vehicleDetails, // Include the vehicle detail with populated vehicle type
                    "serviceDetails": booking.service,
                    "packageDetails": booking.package,
                    "price": booking.price,
                    "bookingDate": booking.bookingDate,
                    "bookingTime": booking.bookingTime,
                    "paymentMode": booking.paymentMode,
                    "paymentStatus": booking.paymentStatus,
                    "orderStatus": booking.orderStatus,
                    "subTotal": booking.subTotal,
                    "coupon_code": booking.coupon_code,
                    "coupon_type": booking.coupon_type,
                    "coupon_amount": booking.coupon_amount,
                    "VAT": booking.VAT,
                    "Total": booking.Total
                };
            });

            res.json({ "data": { "success": 1, "message": "Booking details found successfully...!!", BookingDetails: BookingDetails, "error": 0 } });
        } else {
            return res.json({ "data": { "success": 0, "message": "Booking details not found..!!*", "error": 1 } });
        }

    } catch (error) {
        console.log(error);
        res.status(500).json({ "data": { "success": 0, "message": "Internal Server Error", "error": 1 } });
    }
};

// Get Ongoing Order
module.exports.OngoingOrders = async (req, res) => {
    try {
        const userId = req.body.userId;
        const showBooking = await VehicleBooking.find({ "user.userId": userId, orderStatus: 'pending' });

        if (showBooking.length > 0) {
            // Find the default vehicle for the user and populate the vehicle type details
            const findVehicle = await UserVehicle.find({ userId: userId }).populate('vehicleTypeId', 'vehicle_type image');

            const BookingDetails = showBooking.map(booking => {
                // Find the corresponding vehicle details from findVehicle
                const vehicleDetail = findVehicle.find(vehicle => vehicle._id.equals(booking.vehicle.vehicleId));

                // Customize the vehicleDetails object
                const vehicleDetails = vehicleDetail ? {
                    _id: vehicleDetail._id,
                    vehicle_name: vehicleDetail.vehicle_name,
                    vehicle_number: vehicleDetail.vehicle_number,
                    vehicleTypeId: vehicleDetail.vehicleTypeId
                } : null;

                return {
                    "id": booking._id,
                    "orderNo": booking.orderNo,
                    "userDetails": booking.user,
                    "addressDetails": booking.address,
                    "vehicleDetails": vehicleDetails, // Include the vehicle detail with populated vehicle type
                    "serviceDetails": booking.service,
                    "packageDetails": booking.package,
                    "price": booking.price,
                    "bookingDate": booking.bookingDate,
                    "bookingTime": booking.bookingTime,
                    "paymentMode": booking.paymentMode,
                    "paymentStatus": booking.paymentStatus,
                    "orderStatus": booking.orderStatus,
                    "subTotal": booking.subTotal,
                    "coupon_code": booking.coupon_code,
                    "coupon_type": booking.coupon_type,
                    "coupon_amount": booking.coupon_amount,
                    "VAT": booking.VAT,
                    "Total": booking.Total
                };
            });

            res.json({ "data": { "success": 1, "message": "Ongoing Order found successfully...!!", BookingDetails: BookingDetails, "error": 0 } });
        } else {
            return res.json({ "data": { "success": 0, "message": "Ongoing Order not found..!!*", "error": 1 } });
        }

    } catch (error) {
        console.log(error);
        res.status(500).json({ "data": { "success": 0, "message": "Internal Server Error", "error": 1 } });
    }
}

// module.exports.OngoingOrders = async (req, res) => {
//     try {
//         const userId = req.body.userId;
//         const showBooking = await VehicleBooking.find({ "user.userId": userId , orderStatus: 'pending' });
//         if (showBooking.length > 0) {
//             BookingDetails = showBooking.map(booking => ({
//                 "id": booking._id,
//                 "userDetails": booking.user,
//                 "addressDetails": booking.address,
//                 "vehicleDetails": booking.vehicle,
//                 "servieDetails": booking.service,
//                 "packageDetails": booking.package,
//                 "price": booking.price,
//                 "bookingDate": booking.bookingDate,
//                 "paymentMode": booking.paymentMode,
//                 "paymentStatus": booking.paymentStatus,
//                 "orderStatus": booking.orderStatus,
//                 "subTotal": booking.subTotal,
//                 "VAT": booking.VAT,
//                 "Total": booking.Total
//             }));
//             res.json({ "data": { "success": 1, "message": "Ongoing Order found successfully...!!", BookingDetails: BookingDetails, "error": 0 } });
//         }
//         else {
//             return res.json({ "data": { "success": 0, "message": "Ongoing Order not found..!!*", "error": 1 } });
//         }

//     } catch (error) {
//         console.log(error);
//     }
// }

// Get Completed Order


module.exports.CompletedOrders = async (req, res) => {
    try {
        const userId = req.body.userId;
        const showBooking = await VehicleBooking.find({ "user.userId": userId, orderStatus: 'completed' });

        if (showBooking.length > 0) {
            // Find the default vehicle for the user and populate the vehicle type details
            const findVehicle = await UserVehicle.find({ userId: userId }).populate('vehicleTypeId', 'vehicle_type image');

            const BookingDetails = showBooking.map(booking => {
                // Find the corresponding vehicle details from findVehicle
                const vehicleDetail = findVehicle.find(vehicle => vehicle._id.equals(booking.vehicle.vehicleId));

                // Customize the vehicleDetails object
                const vehicleDetails = vehicleDetail ? {
                    _id: vehicleDetail._id,
                    vehicle_name: vehicleDetail.vehicle_name,
                    vehicle_number: vehicleDetail.vehicle_number,
                    vehicleTypeId: vehicleDetail.vehicleTypeId
                } : null;

                return {
                    "id": booking._id,
                    "orderNo": booking.orderNo,
                    "userDetails": booking.user,
                    "addressDetails": booking.address,
                    "vehicleDetails": vehicleDetails, // Include the vehicle detail with populated vehicle type
                    "serviceDetails": booking.service,
                    "packageDetails": booking.package,
                    "price": booking.price,
                    "bookingDate": booking.bookingDate,
                    "bookingTime": booking.bookingTime,
                    "paymentMode": booking.paymentMode,
                    "paymentStatus": booking.paymentStatus,
                    "orderStatus": booking.orderStatus,
                    "subTotal": booking.subTotal,
                    "coupon_code": booking.coupon_code,
                    "coupon_type": booking.coupon_type,
                    "coupon_amount": booking.coupon_amount,
                    "VAT": booking.VAT,
                    "Total": booking.Total
                };
            });

            res.json({ "data": { "success": 1, "message": "Completed Order found successfully...!!", BookingDetails: BookingDetails, "error": 0 } });
        } else {
            return res.json({ "data": { "success": 0, "message": "Completed Order not found..!!*", "error": 1 } });
        }

    } catch (error) {
        console.log(error);
        res.status(500).json({ "data": { "success": 0, "message": "Internal Server Error", "error": 1 } });
    }
};

// Cancel Order
module.exports.CancelOrder = async (req, res) => {
    try {
        const userId = req.body.userId;
        const bookingId = req.body.bookingId;
        const cancelBooking = await VehicleBooking.findOneAndUpdate({ _id: bookingId, "user.userId": userId }, { $set: { orderStatus: 'cancelled' } });
        if (cancelBooking) {
            const findCancel = await CancelledOrder.findOne({ userId: userId, bookingId: bookingId });
            if (findCancel) {
                return res.json({ "data": { "success": 0, "message": "Order already cancelled..!!*", "error": 1 } });
            } else {
                const cancelData = new CancelledOrder({ userId: userId, bookingId: bookingId });
                const saveCancel = await cancelData.save();
                // Delete the slot booking
                const deleteSlot = await SlotBooking.deleteOne({ userId: userId, bookingId: bookingId });
                return res.json({ "data": { "success": 1, "message": "Order Cancelled successfully..!!", "error": 0 } });
            }
        }
        else {
            return res.json({ "data": { "success": 0, "message": "Order not Cancelled..!!*", "error": 1 } });
        }
    }
    catch (error) {
        console.log(error);
    }
}

// Cancel Order List
module.exports.CancelledOrders = async (req, res) => {
    try {
        const userId = req.body.userId;
        const showBooking = await VehicleBooking.find({ "user.userId": userId, $or: [{ orderStatus: 'cancelled' }, { paymentStatus: 'failed' }] });

        if (showBooking.length > 0) {
            // Find the default vehicle for the user and populate the vehicle type details
            const findVehicle = await UserVehicle.find({ userId: userId }).populate('vehicleTypeId', 'vehicle_type image');

            const BookingDetails = showBooking.map(booking => {
                // Find the corresponding vehicle details from findVehicle 
                const vehicleDetail = findVehicle.find(vehicle => vehicle._id.equals(booking.vehicle.vehicleId));

                // Customize the vehicleDetails object
                const vehicleDetails = vehicleDetail ? {
                    _id: vehicleDetail._id,
                    vehicle_name: vehicleDetail.vehicle_name,
                    vehicle_number: vehicleDetail.vehicle_number,
                    vehicleTypeId: vehicleDetail.vehicleTypeId
                } : null;

                return {
                    "id": booking._id,
                    "orderNo": booking.orderNo,
                    "userDetails": booking.user,
                    "addressDetails": booking.address,
                    "vehicleDetails": vehicleDetails, // Include the vehicle detail with populated vehicle type
                    "serviceDetails": booking.service,
                    "packageDetails": booking.package,
                    "price": booking.price,
                    "bookingDate": booking.bookingDate,
                    "bookingTime": booking.bookingTime,
                    "paymentMode": booking.paymentMode,
                    "paymentStatus": booking.paymentStatus,
                    "orderStatus": booking.orderStatus,
                    "subTotal": booking.subTotal,
                    "coupon_code": booking.coupon_code,
                    "coupon_type": booking.coupon_type,
                    "coupon_amount": booking.coupon_amount,
                    "VAT": booking.VAT,
                    "Total": booking.Total
                };
            });

            res.json({ "data": { "success": 1, "message": "Cancelled Order found successfully...!!", BookingDetails: BookingDetails, "error": 0 } });
        } else {
            return res.json({ "data": { "success": 0, "message": "Cancelled Order not found..!!*", "error": 1 } });
        }

    } catch (error) {
        console.log(error);
        res.status(500).json({ "data": { "success": 0, "message": "Internal Server Error", "error": 1 } });
    }
}

// Refunded Booking 
module.exports.RefundOrder = async (req, res) => {
    try {
        const userId = req.body.userId;
        const bookingId = req.body.bookingId;
        const refundBooking = await RefundedOrder.findOne({ userId: userId, bookingId: bookingId });
        if (refundBooking) {
            return res.json({ "data": { "success": 0, "message": "Order already refunded..!!*", "error": 1 } });
        } else {
            const refundOrder = new RefundedOrder({ userId: userId, bookingId: bookingId });
            const saveRefund = await refundOrder.save();
            const updateOrder = await VehicleBooking.findOneAndUpdate({ _id: bookingId }, { $set: { orderStatus: 'refunded' } });
            const updateSlot = await SlotBooking.deleteOne({ userId: userId, bookingId: bookingId });
            if (saveRefund) {
                return res.json({ "data": { "success": 1, "message": "Order refunded in process..!!", "error": 0 } });
            }
            else {
                return res.json({ "data": { "success": 0, "message": "Order not refunded..!!*", "error": 1 } });
            }
        }
    } catch (error) {
        console.log(error);
    }
}

// Add Review
module.exports.AddReview = async (req, res) => {
    try {
        const AddReviw = new PackageReview({
            packageId: req.body.packageId,
            userId: req.body.userId,
            description: req.body.description,
            date: req.body.date,
            time: req.body.time,
            rating: req.body.rating
        });
        // Save review
        const reviewData = await AddReviw.save();
        if (reviewData) {
            return res.json({ "data": { "success": 1, "message": "Package review added!!", "error": 0 } });
        }
        else {
            return res.json({ "data": { "success": 0, "message": "Package review not added..!!*", "error": 1 } });
        }
    } catch (error) {
        return res.json({ "data": { "success": 0, "message": "Package review not added !!*", "error": 1 } });
    }
}

// Get Review
module.exports.GetReview = async (req, res) => {
    try {
        let reviews = await PackageReview.find({ is_active: true, packageId: req.body.packageId }).populate('packageId').populate('userId', 'image username');
        if (reviews.length > 0) {

            //calculate average rating
            let totalRating = 0;
            if (reviews.length > 0) {
                totalRating = reviews.reduce((acc, review) => acc + review.rating, 0);
                totalRating /= reviews.length; // Calculate average rating
            }

            // add two decimal places
            totalRating = Number(totalRating.toFixed(1));

            // add 0 rating to packages without reviews
            if (!totalRating) {
                totalRating = 0;
            }

            // Fetch package details
            let packages = await Package.find({ _id: req.body.packageId });
            if (packages.length > 0) {
                const packageData = packages.map(package => ({
                    "_id": package._id,
                    "title": package.title,
                    "image": package.image,
                    "reviews": reviews.map(review => ({
                        "_id": review._id,
                        //"packageId": review.packageId._id,
                        "description": review.description,
                        "rating": review.rating,
                        "date": review.date,
                        "userDetails": {
                            "_id": review.userId._id,
                            "name": review.userId.username,
                            "image": review.userId.image
                        },
                    })),
                    "averagerating": totalRating,
                }));
                return res.json({ "data": { "success": 1, "message": "Package review found!!", "packageReviewDetails": packageData, "error": 0 } });
            }
        } else {
            return res.json({ "data": { "success": 0, "message": "Package review not found..!!*", "error": 1 } });
        }
    } catch (error) {
        return res.json({ "data": { "success": 0, "message": "Package review not found..!!*", "error": 1 } });
    }
}