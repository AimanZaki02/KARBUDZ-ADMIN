require('dotenv').config();
const FCM = require('fcm-node');
const Admin = require("../models/AdminModel");
const BookingVehicle = require('../models/VehicleBookingModel');
const User = require('../models/UserModel');
const Service = require('../models/ServiceModel');
const Package = require('../models/PackageModel');
const UserVehicle = require('../models/UserVehiclesModel');
const Currency = require('../models/CurrencyModel');
const Notification = require('../models/NotificationModel');
const RefundedOrder = require('../models/RefundedOrderModel');

// Load Booking
module.exports.loadBooking = async (req, res) => {
    try {
        let loginData = await Admin.find({});
        const currency = await Currency.findOne({});
        const booking = await BookingVehicle.find({});
        res.render('viewBooking', { booking: booking, loginData: loginData, currency: currency });
    } catch (error) {
        console.log(error.message);
    }
}

// Edit Booking
module.exports.editBooking = async (req, res) => {
    try {
        const refund = await RefundedOrder.findOne({ bookingId: req.query.id });
        let loginData = await Admin.find({});
        const booking = await BookingVehicle.findById(req.query.id);
        if (booking) {
            res.render('editBooking', { booking: booking, loginData: loginData, refund: refund });
        } else {
            res.redirect('back');
        }
    } catch (error) {
        console.log(error.message);
    }
}

// Delete Booking
module.exports.deleteBooking = async (req, res) => {
    try {
        const id = req.query.id; // Get the booking ID from the query parameters

        // Find the booking in the database
        const booking = await BookingVehicle.findById(id);

        if (!booking) {
            // If booking not found, return an error message
            return res.status(404).send('Booking not found');
        }

        // If the booking is refunded, remove its associated refund record
        if (booking.orderStatus === 'refunded') {
            await RefundedOrder.deleteOne({ bookingId: id });
        }

        // Delete the booking
        await BookingVehicle.deleteOne({ _id: id });

        console.log(`Booking with ID ${id} has been deleted.`);
        res.redirect('/booking'); // Redirect to the booking list page
    } catch (error) {
        console.log('Error deleting booking:', error.message);
        res.status(500).send('Internal Server Error');
    }
}

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

// Update Booking Status
module.exports.updateBooking = async (req, res) => {
    try {
        const booking = await BookingVehicle.findById(req.body.id);

        // Check if booking exists
        if (booking) {
            // Check if orderStatus is refunded
            if (booking.orderStatus == 'refunded') {
                const refund = await RefundedOrder.findOne({ bookingId: booking._id });
                if (req.file) {
                    refund.refunded_screenshot = req.file.filename;
                    await refund.save();
                }
            }

            // Update booking status
            if (booking.orderStatus != 'refunded') {
                booking.orderStatus = req.body.orderStatus;
                await booking.save();
            }

            // Find Registration Token of User
            const currentUser = await Notification.findOne({ userId: booking.user.userId });

            // Determine the notification content based on orderStatus
            let title, body;
            switch (req.body.orderStatus) {
                case 'pending':
                    title = "Order Pending Confirmation";
                    body = "The order is awaiting confirmation from the service provider.";
                    break;
                case 'confirmed':
                    title = "Order Confirmed";
                    body = "The service provider has confirmed the order";
                    break;
                case 'in_progress':
                    title = "Order In Progress";
                    body = "The car wash service is currently being performed";
                    break;
                case 'ready_for_pickup':
                    title = "Order Ready for Pickup";
                    body = "The vehicle is ready for the customer to pick up";
                    break;
                case 'completed':
                    title = "Order Completed";
                    body = "The car wash service has been completed";
                    break;
                case 'cancelled':
                    title = "Order Cancelled";
                    body = "The order has been cancelled by the customer or service provider";
                    break;
                case 'refunded':
                    title = "Order Refunded";
                    body = "The order has been refunded";
                    break;
                default:
                    title = "Order failed";
                    body = "The order could not be completed due to an issue (e.g., payment failure, service unavailability)";
                    break;
            }

            // Send Notification to User
            const serverKey = process.env.SERVER_KEY;
            const registrationToken = currentUser.registrationToken;

            sendPushNotification(serverKey, registrationToken, title, body, function (err, response) {
                if (err) {
                    console.error("Failed to send push notification:" + registrationToken, err);
                } else {
                    console.log("Push notification sent successfully:" + registrationToken, response);
                }
            });
            res.redirect('/booking');
        } else {
            res.redirect('back');
        }
    } catch (error) {
        console.log(error.message);
    }
}
