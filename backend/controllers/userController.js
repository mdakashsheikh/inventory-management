const asyncHandler = require('express-async-handler');
const User = require('../models/userModel');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

//Generate Token
const generateToken = (id) => {
    return jwt.sign({id}, process.env.JWT_SECRET, {expiresIn: '1d'})
}


//Register User
const registerUser = asyncHandler(async(req, res) => {
    const { name, email, password } = req.body

    if(!name || !email || !password) {
        res.status(400)
        throw new Error('Please fill in all required fields');
    }
    if(password.length < 6) {
        res.status(400)
        throw new Error('Password must be up to 6 characters');
    }

    const userExists = await User.findOne({email})

    if(userExists) {
        res.status(400)
        throw new Error('Email has already been registered');
    }

    //Create a User
    const user = await User.create({
        name,
        email,
        password
    })

    //Generate Token
    const token = generateToken(user._id)

    //Send HTTP-only cookie
    res.cookie('token', token, {
        path: '/',
        httpOnly: true,
        expires: new Date(Date.now() + 1000 * 86400), // 1 Day
        sameSite: 'none',
        secure: true
    })

    if(user) {
        const { _id, name, email, photo, phone, bio } = user
        res.status(201).json({
            _id, name, email, photo, phone, bio, token
        })
    } else {
        res.status(400)
        throw new Error('Invalid user data')
    }
 })


 //Login User 
 const loginUser = asyncHandler(async(req, res) => {

    const { email, password } = req.body;

    //Validate Request
    if( !email || !password ) {
        res.status(400)
        throw new Error('Please add email and password')
    }

    //Check if user exists
    const user = await User.findOne({ email });

    //Generate Token
    const token = generateToken(user._id)

    //Send HTTP-only cookie
    res.cookie('token', token, {
        path: '/',
        httpOnly: true,
        expires: new Date(Date.now() + 1000 * 86400), // 1 Day
        sameSite: 'none',
        secure: true
    })


    if(!user) {
        res.status(400)
        throw new Error('User not found, please signup')
    }

    const passwordIsCorrect = await bcrypt.compare(password, user.password)

    if(user && passwordIsCorrect) {
        const { _id, name, email, photo, phone, bio } = user;
        res.json({
            _id, name, email, photo, phone, bio, token
        })
    } else {
        res.status(400)
        throw new Error('Invalid email and password')
    }
 })


 //Logout User
 const logoutUser = asyncHandler(async(req, res) => {
    res.cookie('token', '', {
        path: '/',
        httpOnly: true,
        expires: new Date(0),
        sameSite: 'none',
        secure: true
    })

    return res.status(200).json({ message: 'Successfully Logged Out'})
 })


 //Get User
 const getUser = asyncHandler(async(req, res) => {
    const user = await User.findById(req.user._id);

    if(user) {
        const { _id, name, email, photo, phone, bio } = user;
        res.status(200).json({
            _id, name, email, photo, phone, bio
        })
    } else {
        res.status(404)
        throw new Error('User not found')
    }
 })

 //Get Login Status
 const loginStatus = asyncHandler(async(req, res) => {
    const token = req.cookies.token;
    if(!token) {
        return res.json(false);
    }
    
    //Varify token
    const varified = jwt.verify(token, process.env.JWT_SECRET);
    if(varified) {
        return res.json(true);
    }

    return res.json(false);
 })

 //Update User
 const updateUser = asyncHandler(async(req, res) => {
    const user = await User.findById(req.user._id);

    if(user) {
        const { name, email, photo, phone, bio } = user;
        user.email = email;
        user.name = req.body.name || name;
        user.phone = req.body.phone || phone;
        user.photo = req.body.photo || photo;
        user.bio = req.body.bio || bio;

        const updateUser = await user.save();
        res.json({
            _id: updateUser._id, 
            name: updateUser.name, 
            email: updateUser.email, 
            photo: updateUser.photo, 
            phone: updateUser.phone, 
            bio: updateUser.bio
        })
    } else {
        res.status(404)
        throw new Error('User not found');
    }
 })

 
//Change Password
const changePassword = asyncHandler(async(req, res) => {
    const user = await User.findById(req.user._id);

    const { oldPassword, password } = req.body;

    if(!user) {
        res.status(404)
        throw new Error('User not found');
    }

    //Validate
    if(!oldPassword || !password) {
        res.status(400)
        throw new Error('Please add Old and New Password')
    }

    //Check oldPassword and newPassword matches in DB
    const passwordIsCorrect = await bcrypt.compare(oldPassword, user.password);

    //Save new password
    if(user && passwordIsCorrect) {
        user.password = password;
        await user.save();
        res.status(200).send('Password Change Successful');
    } else {
        res.status(400)
        throw new Error('Old password is incorrect')
    }
})

//Forgot Password
const forgotPassword = asyncHandler(async(req, res) => {
    const { email } = req.body;
    const user = await User.findOne({ email })

    if(!user) {
        res.status(404)
        throw new Error('User not found');
    }

    //Create reset Token
    
})

module.exports = {
    registerUser,
    loginUser,
    logoutUser,
    getUser,
    loginStatus,
    updateUser,
    changePassword,
    forgotPassword,
}