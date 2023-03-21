const model = require('../models/user');
const rToken = require('../models/resetToken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const bcrypt = require('bcrypt');

//transporter for emailing
const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
        user: "intheloop.sys@gmail.com",
        pass: "vbkipgwdvibtjhys"
    }
});


//renders the signup page
exports.new = (req, res)=>{
    return res.render('./user/new');
};

//handles signup POST request
exports.newUser = (req, res, next) => {
    let user = new model(req.body);
    user.save()
    .then(() => res.redirect('/users/login'))
    .catch(err => {
        if(err.name === 'ValidationError') {
            err.status = 400;
            err.message = "Bad Database Request";
        }

        if(err.name === 'MongoError') {
            err.status = 400;
            err.message = "Bad Database Request";
        }

        next(err);

    });
};

//renders the login page
exports.login = (req, res) => {
    res.render('./user/login');
};

//renders passwords change req link page
exports.requestPasswdLink = (req, res) => {
    res.render('./user/req-pass-change');
};

//handles POST req for sending password link
exports.sendPasswordReset = (req, res, next) => {
    let reqToken = crypto.randomBytes(8).toString('hex');
    let email = req.body.email;

    model.findOne({email: email}, (err, user) => {
        if(err) {
            next(err);
        }

        if(user) {
            //stores id and token into the reset token collection. The hashed version of the id and token will be in the URL sent to the user itself
            let stored_token = new rToken({createdAt: new Date(), token: reqToken, email: email});
            stored_token.save()
            .then((result) => {
                if(result) {
                    let reset_link = "http://localhost:8080/users/reset-password?token=" + reqToken + "&email=" + email;
                    let about = "In The Loop Password Change Request";
                    let content = "<h1>You've Requested a Password Change</h1><br><p>To reset your password, click the following link or copy/paste it into your browser. The link will expire in 3 minutes and will become invalid once used.</p><br><a href='" + reset_link + "'>" + reset_link + "</a>";
                    sendEmail(email, about, content);
                    let title = "Reset Link Sent!";
                    let msg = "If your email exists within our records, you will receive your password reset link shortly.";
                    res.render('./user/notification', {title, msg});
                }
            })
            .catch((err)=>next(err)); //current error catch is only temporary; still figuring out what to do with it
        } else {
            //This lets the user know that the email has been 'sent'; this is to avoid letting threat actors know that the email doesn't exist in the database
            let title = "Reset Link Sent!";
            let msg = "If your email exists within our records, you will receive your password reset link shortly.";
            res.render('./user/notification', {title, msg});
        }

    })
};

//renders the page for resetting passwords
exports.resetPassWdPage = (req, res, next) => {
    let urlToken = req.query.token;
    let urlEmail = req.query.email;

    rToken.findOne({email: urlEmail}, (err, rToken) => {
        if(err) {
            next(err);
        }

        if(rToken) {
            rToken.compareTokens(urlToken)
            .then((result) => {
                if(result) {
                    res.render('./user/reset-password', {email: urlEmail});
                } else {
                    let err = new Error();
                    err.status = 410;
                    err.message = "This link is no longer valid.";
                    next(err);
                }
            })
        }
    })
};

//handles POST req for resetting password as guest
exports.guestResetPasswd = (req, res, next) => {
    let email = req.body.userEmail;

    model.findOne({email: email}, (err, user) => {
        if(err) {
            next(err);
        }

        if(user) {
            let password = req.body.password;
            bcrypt.hash(password, 10)
            .then((hash) => {
                model.findOneAndUpdate({email: email}, {password: hash})
                .then((result) => {
                    if(result) {
                        let about = "Your Password Has Been Changed";
                        let content = "<p>Your password has recently been changed. If you did not request or authorized this change, it is recommended that you change your password immediately or contact us.";
                        sendEmail(email, about, content);

                        rToken.findOneAndDelete({email: email}, (err, rToken) => {
                            if(err) {
                                next(err);
                            } 

                            if(rToken || rToken == null) {
                                res.redirect('/users/login');
                            }
                        })

                    } else {
                        let title = "We were unable to change your password";
                        let msg = "Try again or request a new link.";
                        res.render('./user/notification', {title, msg});
                    }
                })
                .catch(err=>next(err))
            })
            .catch(err=>next(err))
        }
    })
};

exports.changeEmail = (req, res) => {
    res.render('./user/change-email');
};
exports.changePassword = (req, res) => {
    res.render('./user/change-password');
};

function sendEmail(email, title, content) {
    let mailConfigs = {
        from: "intheloop.sys@gmail.com",
        to: email,
        subject: title,
        html: content
    }

    transporter.sendMail(mailConfigs, (err, info) => {
        if(error) {
            console.log(error.status + " " + error.message)
        }

        let title = "Reset Link Sent!";
        let msg = "If your email exists within our records, you will receive your password reset link shortly.";
        res.render('./user/notification', {title, msg});
    });

    return true;
}