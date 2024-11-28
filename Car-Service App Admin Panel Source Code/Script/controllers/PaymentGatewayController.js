const Payment = require("../models/PaymentGatewayModel");
const Admin = require("../models/AdminModel");

// Load payment method page
module.exports.loadPayment = async (req, res) => {
    try {
        const payment = await Payment.findOne();
        res.render('paymentGateway', { payment: payment });
    } catch (error) {
        console.log(error.message);
    }
}

// Add payment method
module.exports.addPaymentMethod = async (req, res) => {
    try {
        let loginData = await Admin.find({});
        for (let i in loginData) {
            if (String(loginData[i]._id) === req.session.user_id) {
                if (loginData[i].is_admin == 1) {
                    const paymentRecord = await Payment.find();
                    if (paymentRecord.length <= 0) {
                        const payment_method = new Payment({
                            paypal_is_enable: req.body.paypal_is_enable == "on" ? 1 : 0,
                            paypal_mode: req.body.paypal_mode,
                            paypal_testmode_merchant_Id: req.body.paypal_testmode_merchant_Id,
                            paypal_testmode_tokenization_key: req.body.paypal_testmode_tokenization_key,
                            paypal_testmode_public_key: req.body.paypal_testmode_public_key,
                            paypal_testmode_private_key: req.body.paypal_testmode_private_key,
                            paypal_livemode_merchant_Id: req.body.paypal_livemode_merchant_Id,
                            paypal_livemode_tokenization_key: req.body.paypal_livemode_tokenization_key,
                            paypal_livemode_public_key: req.body.paypal_livemode_public_key,
                            paypal_livemode_private_key: req.body.paypal_livemode_private_key,
                            stripe_is_enable: req.body.stripe_is_enable == "on" ? 1 : 0,
                            stripe_mode: req.body.stripe_mode,
                            stripe_testmode_publishable_key: req.body.stripe_testmode_publishable_key,
                            stripe_testmode_secret_key: req.body.stripe_testmode_secret_key,
                            stripe_livemode_publishable_key: req.body.stripe_livemode_publishable_key,
                            stripe_livemode_secret_key: req.body.stripe_livemode_secret_key,
                            razorpay_is_enable: req.body.razorpay_is_enable == "on" ? 1 : 0,
                            razorpay_mode: req.body.razorpay_mode,
                            razorpay_testmode_key_Id: req.body.razorpay_testmode_key_Id,
                            razorpay_testmode_key_secret: req.body.razorpay_testmode_key_secret,
                            razorpay_livemode_key_Id: req.body.razorpay_livemode_key_Id,
                            razorpay_livemode_key_secret: req.body.razorpay_livemode_key_secret,
                        });
                        const saveMethod = await payment_method.save();
                        if (saveMethod) {
                            res.redirect('/payment-gateway');
                        }
                        else {
                            res.render('paymentGateway', { message: "Payment Method Not Added" });
                        }
                    }
                    if (paymentRecord.length > 0) {
                        const payment_method = await Payment.findOneAndUpdate({
                            $set: {
                                paypal_is_enable: req.body.paypal_is_enable == "on" ? 1 : 0,
                                paypal_mode: req.body.paypal_mode,
                                paypal_testmode_merchant_Id: req.body.paypal_testmode_merchant_Id,
                                paypal_testmode_tokenization_key: req.body.paypal_testmode_tokenization_key,
                                paypal_testmode_public_key: req.body.paypal_testmode_public_key,
                                paypal_testmode_private_key: req.body.paypal_testmode_private_key,
                                paypal_livemode_merchant_Id: req.body.paypal_livemode_merchant_Id,
                                paypal_livemode_tokenization_key: req.body.paypal_livemode_tokenization_key,
                                paypal_livemode_public_key: req.body.paypal_livemode_public_key,
                                paypal_livemode_private_key: req.body.paypal_livemode_private_key,
                                stripe_is_enable: req.body.stripe_is_enable == "on" ? 1 : 0,
                                stripe_mode: req.body.stripe_mode,
                                stripe_testmode_publishable_key: req.body.stripe_testmode_publishable_key,
                                stripe_testmode_secret_key: req.body.stripe_testmode_secret_key,
                                stripe_livemode_publishable_key: req.body.stripe_livemode_publishable_key,
                                stripe_livemode_secret_key: req.body.stripe_livemode_secret_key,
                                razorpay_is_enable: req.body.razorpay_is_enable == "on" ? 1 : 0,
                                razorpay_mode: req.body.razorpay_mode,
                                razorpay_testmode_key_Id: req.body.razorpay_testmode_key_Id,
                                razorpay_testmode_key_secret: req.body.razorpay_testmode_key_secret,
                                razorpay_livemode_key_Id: req.body.razorpay_livemode_key_Id,
                                razorpay_livemode_key_secret: req.body.razorpay_livemode_key_secret,
                            }
                        });
                        const saveMethod = await payment_method.save();
                        if (saveMethod) {
                            res.redirect('/payment-gateway');
                        }
                        else {
                            res.render('paymentGateway', { message: "Payment Method Not Updated" });
                        }
                    }
                }
                else {
                    req.flash('error', 'You have no access to add payment method , You are not super admin !! *');
                    return res.redirect('back');
                }
            }
        }

    } catch (error) {
        console.log(error.message);
    }
}