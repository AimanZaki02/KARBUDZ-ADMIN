const Admin = require("../models/AdminModel");
const Page = require("../models/PageModel");

// Load Page
module.exports.pageLoad = async (req, res) => {
    try {
        const pages = await Page.findOne({});
        res.render('page', { pages: pages });
    } catch (error) {
        console.log(error.message);
    }
}

// Add Pages
module.exports.addPages = async (req, res) => {
    try {
        let loginData = await Admin.find({});
        for (let i in loginData) {
            if (String(loginData[i]._id) === req.session.user_id) {
                if (loginData[i].is_admin == 1) {
                    const addPages = await Page.find();
                    if (addPages.length <= 0) {
                        const pageData = new Page({
                            privacy_policy: req.body.privacy_policy,
                            terms_condition: req.body.terms_condition,
                            about:req.body.about,
                            help:req.body.help
                        });
                        const savePages = await pageData.save();
                        if (savePages) {
                            res.redirect('/page');
                        }
                        else {
                            res.render('page', { message: "Pages Not Updated" });
                        }
                    }
                    if (addPages.length > 0) {
                        const pageData = await Page.findOneAndUpdate(
                            { $set: { 
                                privacy_policy: req.body.privacy_policy,
                                terms_condition: req.body.terms_condition,
                                about:req.body.about,
                                help:req.body.help
                            }});
                        const savePages = await pageData.save();
                        if (savePages) {
                            res.redirect('/page');
                        }
                        else {
                            res.render('page', { message: "Pages Not Updated" });
                        }
                    }
                }
                else {
                    req.flash('error', 'You have no access to update pages , You are not super admin !! *');
                    return res.redirect('back');
                }
            }
        }

    } catch (error) {
        console.log(error.message);
    }
}