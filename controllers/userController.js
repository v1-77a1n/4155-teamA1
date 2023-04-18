const model = require('../models/user');
const rToken = require('../models/resetToken');
const message = require('../models/message');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

//transporter for emailing
const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
        user: "noreply.intheloop@gmail.com",
        pass: "kziicheouikmuaey"
    }
});


//renders the signup page
exports.new = (req, res) => {
    return res.render('./user/new');
};

//handles signup POST request
exports.newUser = (req, res, next) => {
    let user = new model(req.body);
    user.save()
        .then(() => {
            req.flash('success', "You've successfully signed up for an account.");
            res.redirect('/users/login');
        })
        .catch(err => {
            if (err.name === 'ValidationError') {
                err.status = 400;
                err.message = "Bad Database Request";
            }

            if (err.name === 'MongoError') {
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

//Handles post request for logging in
exports.loggingIn = (req, res, next) => {
    let email = req.body.username;
    let password = req.body.password;

    model.findOne({ email: email }, (err, user) => {
        if (err) { next(err); }

        if (user) {
            user.comparePassword(password)
                .then((result) => {
                    if (result) {
                        req.session.user = user._id;
                        req.flash('success', 'You have successfully logged in');
                        res.redirect('/');
                    } else {
                        req.flash('error', 'Wrong password');
                        res.redirect('/users/login');
                    }
                })
        } else {
            req.flash('error', 'Wrong username');
            res.redirect('/users/login');
        }
    })
}

//renders passwords change req link page
exports.requestPasswdLink = (req, res) => {
    res.render('./user/req-pass-change');
};

//handles POST req for sending password link
exports.sendPasswordReset = (req, res, next) => {
    let reqToken = crypto.randomBytes(8).toString('hex');
    let email = req.body.email;

    model.findOne({ email: email }, (err, user) => {
        if (err) {
            next(err);
        }

        if (user) {
            //stores id and token into the reset token collection. The hashed version of the id and token will be in the URL sent to the user itself
            let stored_token = new rToken({ createdAt: new Date(), token: reqToken, email: email });
            stored_token.save()
                .then((result) => {
                    if (result) {
                        let reset_link = "http://localhost:8080/users/reset-password?token=" + reqToken + "&email=" + email;
                        let about = "In The Loop Password Change Request";
                        let content = "<h1>You've Requested a Password Change</h1><br><p>To reset your password, click the following link or copy/paste it into your browser. The link will expire in 3 minutes and will become invalid once used.</p><br><a href='" + reset_link + "'>" + reset_link + "</a>";
                        sendEmail(email, about, content);
                        req.flash('success', 'Your link has been sent! If your email exists within our records, you will receive your link shortly');
                        res.redirect('/');
                    }
                })
                .catch((err) => next(err)); //current error catch is only temporary; still figuring out what to do with it
        } else {
            //This lets the user know that the email has been 'sent'; this is to avoid letting threat actors know that the email doesn't exist in the database
            req.flash('success', 'Your link has been sent! If your email exists within our records, you will receive your link shortly');
            res.redirect('/');
        }

    })
};

//renders the page for resetting passwords
exports.resetPassWdPage = (req, res, next) => {
    let urlToken = req.query.token;
    let urlEmail = req.query.email;

    rToken.findOne({ email: urlEmail }, (err, rToken) => {
        if (err) {
            next(err);
        }

        if (rToken) {
            rToken.compareTokens(urlToken)
                .then((result) => {
                    if (result) {
                        res.render('./user/reset-password', { email: urlEmail });
                    } else {
                        req.flash('error', 'This link is no longer valid');
                        res.redirect('/users/req-pass-change');
                    }
                })
        } else {
            req.flash('error', 'This link is no longer valid');
            res.redirect('/users/req-pass-change');
        }
    })
};

//handles POST req for resetting password as guest
exports.guestResetPasswd = (req, res, next) => {
    let email = req.body.userEmail;

    model.findOne({ email: email }, (err, user) => {
        if (err) {
            next(err);
        }

        if (user) {
            let password = req.body.password;
            bcrypt.hash(password, 10)
                .then((hash) => {
                    model.findOneAndUpdate({ email: email }, { password: hash })
                        .then((result) => {
                            if (result) {
                                let about = "Your Password Has Been Changed";
                                let content = "<p>Your password has recently been changed. If you did not request or authorized this change, it is recommended that you change your password immediately or contact us.";

                                req.flash('success', 'Your password has successfully been changed!');

                                sendEmail(email, about, content);
                                rToken.findOneAndDelete({ email: email }, (err, rToken) => {
                                    if (err) {
                                        next(err);
                                    }

                                    if (rToken || rToken == null) {
                                        res.redirect('/users/login');
                                    }
                                })

                            } else {
                                req.flash('error', 'We were unable to change your password. Try again or request a new link.');
                            }
                        })
                        .catch(err => next(err))
                })
                .catch(err => next(err))
        }
    })
};

//handles rendering of change email and change password pages
exports.changeEmail = (req, res) => {
    res.render('./user/change-email');
};
exports.changePassword = (req, res) => {
    res.render('./user/change-password');
};

//Handles post request for change of email while logged in
exports.emailChangeHandler = (req, res, next) => {
    let id = req.session.user;
    let currentEmail = "";
    let newEmail = req.body.email;
    let password = req.body.password;

    model.findOne({ _id: id }, (err, user) => {
        if (err) {
            next(err);
        }

        if (user) {
            currentEmail = user.email;
            user.comparePassword(password)
                .then((result) => {
                    if (result) {
                        model.findOneAndUpdate({ _id: id }, { email: newEmail }, (err, user) => {
                            if (err) {
                                next(err);
                            }

                            if (user) {
                                req.flash('success', 'Your email has successfully been changed!');
                                let about = "Your Email Has Been Changed!";
                                let content = "Your email was changed from " + currentEmail + " to " + newEmail + ". This notification has been sent to both your old and your new email.";
                                let to = currentEmail + ", " + newEmail;
                                sendEmail(to, about, content);
                                res.redirect('/settings');
                            } else {
                                req.flash('error', 'Something went wrong while trying to update your email. Please try again later.');
                                res.redirect('/settings');
                            }
                        })
                    } else {
                        req.flash('error', 'Wrong password');
                        res.redirect('/users/change-email');
                    }
                })
                .catch((err) => next(err))
        } else {
            let error = new Error();
            next(error);
        }
    })
};

//Handles post request for change of password while logged in
exports.passwordChangeHandler = (req, res, next) => {
    let id = req.session.user;
    let password = req.body.password;
    let confirmPassword = req.body.confirmPassword;
    let newPassword = req.body.newPassword;

    model.findOne({ _id: id })
        .then((user) => {
            if (user && (confirmPassword === newPassword)) {
                user.comparePassword(password)
                    .then((result) => {
                        if (result) {
                            bcrypt.hash(newPassword, 10)
                                .then((hash) => {
                                    model.findOneAndUpdate({ _id: id }, { password: hash }, (err, user) => {
                                        if (err) { next(err); }

                                        if (user) {
                                            req.flash('success', "You've successfully changed your password!");
                                            let email = user.email;
                                            let about = "Your Password Has Been Changed";
                                            let content = "This is your confirmation email that you've changed your password.";
                                            sendEmail(email, about, content);
                                            res.redirect('/settings');
                                        } else {
                                            req.flash('error', 'There was an error attempting to update your password. Please try again later or contact us.');
                                            res.redirect('/')
                                        }
                                    })
                                })
                                .catch(err => next(err))
                        } else {
                            req.flash('error', 'The password you entered does not match the current password for your account');
                            res.redirect('/users/change-password');
                        }
                    })
                    .catch(err => next(err))
            } else {
                req.flash('error', 'New Password and Password Confirmation Not Matching');
                res.redirect('/users/change-password');
            }
        })
        .catch(err => next(err))
};

//Handles logout request
exports.logout = (req, res, next) => {
    req.session.destroy((err) => {
        if (err) {
            return next(err);
        } else {
            res.redirect('/');
        }
    })
};

function sendEmail(email, title, content) {
    let mailConfigs = {
        from: "intheloop.sys@gmail.com",
        to: email,
        subject: title,
        html: content
    }

    transporter.sendMail(mailConfigs, (err, info) => {
        if (err) {
            console.log(err.status + " " + err.message)
        }

    });

    return true;
};

// Gets profile page
exports.profile = (req, res) => {
    let id = req.session.user;
    model.findOne({ _id: id }, (err, user) => {
        res.render('./user/profile', { user });
    });

};

// Gets freinds page
exports.friends = (req, res) => {
    res.render('./user/friends');
};

// Gets messages page
exports.messages = (req, res) => {
    let id = req.session.user;
    model.findOne({_id: id}).populate('inbox')
    .then((user) => {
        let inboxArr = user.inbox;
        console.log(inboxArr); //delete this line after testing
        res.render('./user/messages', { inboxArr });
    })
    .catch((err)=>next(err));
};

//get individual message page
exports.messages = (req, res, next) => {
    let messageId = req.query.message;
    message.findOne({_id: messageId})
    .then((message) => {
        res.render('./users/viewMessage', {message});
    })
    .catch((err)=>{next(err)});
}
//Gets page to send message
exports.sendMessagePage = (req, res) => {
    let email = req.query.friend;
    model.findOne({email: email})
    .then((user) => {
        let fullName = user.firstName + " " + user.lastName;
        res.render('./user/sendMessage', {recip: fullName});
    })
    .catch((err) => {
        next(err);
    })
}

//Sends message - POST req
exports.sendMessage = (req, res, next) => {
    let fullName = req.query.friend.split(" ");
    let userId = req.session.user;
    let msgSubject = req.body.subject;
    let msgText = req.body.text;

    //finds logged in user
    model.findOne({_id: userId})
    .then((user) => {
        //find friend
        model.findOne({firstName: fullName["0"], lastNmae: fullName["1"]})
        .then((friend) => {
            let friendId = friend._id;
            //if user's friends list includes friend's ID
            if(user.friends.includes(friendId)) {
                let newMessage = new message({sender: userId, recipient: friendId, subject: msgSubject, msg: msgText });
                //save message and then push the message's _id to the friend's inbox
                newMessage.save()
                .then((message) => {
                    let messageId = message._id;
                    model.findOneAndUpdate({_id: friendId}, {$push: {inbox: messageId}})
                })
                .catch((err) => {next(err);})
            }
        })
        .catch((err) => {next(err);})
    })
    .catch((err)=>{next(err);})
}
