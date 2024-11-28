// const Admin = require('../models/AdminModel');
// const StandardRate = require('../models/StandardRatesModel');

// // Load standard rate
// module.exports.loadStandardRate = async (req, res) => {
//     try {
//         const standardRate = await StandardRate.findOne({});
//         res.render('standardRates', { standardRate });
//     } catch (error) {
//         console.log(error.message);
//     }
// }

// // Add standard rate
// module.exports.addStandardRate = async (req, res) => {
//     try {
//         let loginData = await Admin.find({});
//         for (let i in loginData) {
//             if (String(loginData[i]._id) === req.session.user_id) {
//                 if (loginData[i].is_admin == 1) {
//                     const standardRate = await StandardRate.findOne();
//                     if (standardRate) {
//                         standardRate.country_code = req.body.country_code;
//                         standardRate.tax_name = req.body.tax_name;
//                         standardRate.tax_rate = req.body.tax_rate;
//                         const storeStandardRate = await standardRate.save();
//                         res.redirect('/standard-rates');
//                     }
//                     else {
//                         const standardRate = new StandardRate({
//                             country_code: req.body.country_code,
//                             tax_name: req.body.tax_name,
//                             tax_rate: req.body.tax_rate
//                         });
//                         const storeStandardRate = await standardRate.save();
//                         res.redirect('/standard-rates');
//                     }
//                 }
//                 else {
//                     req.flash('error', 'You have no access to add Standard Rates , You are not super admin !! *');
//                     return res.redirect('back');
//                 }
//             }
//         }
//     } catch (error) {
//         console.log(error.message);
//     }
// }