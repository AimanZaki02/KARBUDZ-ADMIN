const Admin = require("../models/AdminModel");
const SMTP = require("../models/SMTPModel");

// Load SMTP page
module.exports.smtpLoad = async (req, res) => {
    try {
        const smtp = await SMTP.findOne({});
        res.render('SMTP', { smtp: smtp });
    } catch (error) {
        console.log(error.message);
    }
}

// Add SMTP
module.exports.setSMTP = async (req, res) => {
    try {
        let loginData = await Admin.find({});

        for (let i in loginData) {

            if (String(loginData[i]._id) === req.session.user_id) {

                if (loginData[i].is_admin == 1) {

                    const addSMTP = await SMTP.find();

                    if (addSMTP.length <= 0) {

                        const SMTPData = new SMTP({
                            host: req.body.host,
                            port: req.body.port,
                            email: req.body.email,
                            password: req.body.password,
                            encryption: req.body.encryption
                        });

                        const saveSMTP = await SMTPData.save();

                        if (saveSMTP) {
                            res.redirect('back');
                        }
                        else {
                            res.render('page', { message: "SMTP Not Updated" });
                        }
                    }

                    if (addSMTP.length > 0) {

                        const SMTPData = await SMTP.findOneAndUpdate(
                            {
                                $set: {
                                    host: req.body.host,
                                    port: req.body.port,
                                    email: req.body.email,
                                    password: req.body.password,
                                    encryption: req.body.encryption
                                }
                            });

                        const saveSMTP = await SMTPData.save();

                        if (saveSMTP) {
                            res.redirect('back');
                        }
                        else {
                            res.render('page', { message: "SMTP Not Updated" });
                        }
                    }
                }
                else {
                    req.flash('error', 'You have no access to update SMTP , You are not super admin !! *');
                    return res.redirect('back');
                }
            }
        }

    } catch (error) {
        console.log(error.message);
    }
}
