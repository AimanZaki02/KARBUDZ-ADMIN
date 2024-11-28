const Admin = require("../models/AdminModel");
const Intro = require("../models/IntroModel");
const functions = require("../functions/deleteImage");

// Load intro page
module.exports.loadIntro = async (req, res) => {
    try {
        res.render("addIntro");
    } catch (error) {
        console.error(error);
    }
};

// Add intro
module.exports.addIntro = async (req, res) => {
    try {
        let loginData = await Admin.find({});
        for (let i in loginData) {
            if (String(loginData[i]._id) === req.session.user_id) {
                if (loginData[i].is_admin == 1) {
                    const intros = new Intro({ 
                        title: req.body.title, 
                        image: req.file.filename, 
                        description:req.body.description,
                        is_active: req.body.is_active == "on" ? 1 : 0 
                    });
                    await intros.save();
                    res.redirect("/view-intro");
                    return;
                } else {
                    req.flash('error', 'You have no access to add Intro, You are not super admin !! *');
                    return res.redirect('back');
                }
            }
        }

    } catch (error) {
        console.error(error);
    }
};

// View intro
module.exports.viewIntro = async (req, res) => {
    try {
        let loginData = await Admin.find({});
        const intros = await Intro.find({}).sort({ updatedAt: -1 });
        if(intros){
            res.render("viewIntro", { intros, loginData });
        }
        else {
            console.log(error.message);
        }
    } catch (error) {
        console.error(error);
    }
};

// Edit intro
module.exports.editIntro = async(req,res) => {
    try {
        let loginData = await Admin.find({});
        for (let i in loginData) {
            if (String(loginData[i]._id) === req.session.user_id) {
                if (loginData[i].is_admin == 1) {
                    const intros = await Intro.findById({_id: req.query.id});
                    res.render("editIntro", { intros, loginData });
                    return;
                } else {
                    req.flash('error', 'You have no access to edit Intro, You are not super admin !! *');
                    return res.redirect('back');
                }
            }
        }
    } catch (error) {
        console.error(error);
    }
}

// Update intro
module.exports.updateIntro = async(req,res) => {
    try {
        let loginData = await Admin.find({});
        for (let i in loginData) {
            if (String(loginData[i]._id) === req.session.user_id) {
                if (loginData[i].is_admin == 1) {
                    const intros = await Intro.findById({_id: req.body.id});
                    intros.title = req.body.title;
                    intros.description = req.body.description;
                    if(req.file){
                        await functions.deleteImage(intros.image);
                        intros.image = req.file.filename;
                    }
                    //intros.is_active = req.body.is_active == "on" ? 1 : 0;
                    await intros.save();
                    res.redirect("/view-intro");
                    return;
                } else {
                    req.flash('error', 'You have no access to update Intro, You are not super admin !! *');
                    return res.redirect('back');
                }
            }
        }
    } catch (error) {
        console.error(error);
    }
}

// Active status
module.exports.activeStatus = async(req,res) => {
    try {
        let loginData = await Admin.find({});
        for (let i in loginData) {
            if (String(loginData[i]._id) === req.session.user_id) {
                if (loginData[i].is_admin == 1) {
                    const intros = await Intro.findById({_id: req.params.id});
                    intros.is_active = intros.is_active == 1 ? 0 : 1;
                    await intros.save();
                    res.redirect("/view-intro");
                    return;
                } else {
                    req.flash('error', 'You have no access to change status of Intro, You are not super admin !! *');
                    return res.redirect('back');
                }
            }
        }
    } catch (error) {
        console.error(error);
    }
}

// Delete intro
module.exports.deleteIntro = async(req,res) => {
    try {
        const intros = await Intro.findById(req.query.id);
        if (intros) {
            await functions.deleteImage(intros.image);
        }
        const deleteIntro = await Intro.deleteOne({_id: req.query.id});
        res.redirect("/view-intro");
    } catch (error) {
        console.error(error);
    }
}