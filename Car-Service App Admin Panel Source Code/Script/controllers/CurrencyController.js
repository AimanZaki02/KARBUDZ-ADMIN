const Currency = require('../models/CurrencyModel');
const admin = require('../models/AdminModel');

// Load currency page
module.exports.loadCurrency = async (req, res) => {
    try {
        const currencyData = await Currency.findOne({})
        const selectedCurrency = currencyData ? currencyData.currency : "";
        return res.render('currency', { selectedCurrency });
    } catch (error) {
        console.error('Error fetching currency:', error);
    }
}

// Add currency
module.exports.addCurrency = async (req, res) => {
    try {
        let loginData = await admin.find({});
        for (let i in loginData) {
            if (String(loginData[i]._id) === req.session.user_id) {
                if (loginData[i].is_admin == 1) {
                    const findCurrency = await Currency.findOne({});
                    if (!findCurrency) {
                        const currencyData = Currency.create({ currency: req.body.currency });
                        return res.redirect('back');
                    }
                    else {
                        const currencyData = await Currency.updateOne({ currency: req.body.currency });
                        return res.redirect('back');
                    }
                } else {
                    req.flash('error', 'You have no access to change currency , You are not super admin !! *');
                    return res.redirect('back');
                }
            }
        }
    } catch (error) {
        console.error('Error fetching currency :', error);
    }
}