const router = require('express').Router();
const User = require("../models/User");

// Bring in the User Registration function
const { userRegister, userLogin, adminLogin } = require('../utils/Auth');


/***************************************************************************************************
REGISTRATIONS => STARTS
 ***************************************************************************************************/
// Admin Registration Route
router.post('/register-admin', async (req, res) => {
    await userRegister(req.body, "admin", req.body.verifyCode, res);
});

// Users Registeration Route
router.post('/register-agent', async (req, res) => {
    await userRegister(req.body, "agent", req.body.verifyCode, res);
});

router.post('/register-supplier', async (req, res) => {
    await userRegister(req.body, "supplier", req.body.verifyCode, res);
});

router.post('/register-business', async (req, res) => {
    await userRegister(req.body, "business", req.body.verifyCode, res);
});

router.post('/register-individual', async (req, res) => {
    await userRegister(req.body, "individual", req.body.verifyCode, res);
});
/****************************************************************************************************
REGISTRATIONS => ENDS
 ***************************************************************************************************/

/****************************************************************************************************
VERIFY => START
 ***************************************************************************************************/
router.get('/verifyEmail', async (req, res) => {
    try {
        const confirmVerifyCode = req.body.verifyCode
        const user = await User.findOne({ confirmationCode: confirmVerifyCode });
        console.log(user)
        if (user) {
            user.confirmationCode = "",
                user.isVerified = true
            await user.save()
            res.status(200).json({
                message: "Hurry! Your account has been verified, kindly login.",
                success: true
            })
        }
        else {
            res.status(500).json("Email not verified")
        }
    } catch (err) {
        res.status(500).json(err)
    }

})
/****************************************************************************************************
VERIFY => ENDS
 ***************************************************************************************************/

/****************************************************************************************************
LOGIN => START
 ***************************************************************************************************/
// Users Login Route
router.post('/login-user', async (req, res) => {
    await userLogin(req.body, res);
});

// Admin Login Route
router.post('/login-admin', async (req, res) => {
    await adminLogin(req.body, "admin", res);
});
/****************************************************************************************************
LOGIN => ENDS
 ***************************************************************************************************/

module.exports = router;