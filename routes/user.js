const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jsonwebtoken = require("jsonwebtoken");
const {User} = require("../schema/user.schema");
const dotenv = require("dotenv");
dotenv.config();

// register an user
router.post("/register", async (req, res)=>{
    const {name, email, password, mobile} = req.body;
    const ifUserExists = await User.findOne({ email });
    if(ifUserExists){
        return res.status(400).json({message: "User already exists"});
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({name, email, mobile, password: hashedPassword});
    await user.save();
    res.status(201).json({message: "User created Successfully"});
})

// get all users
router.get("/", async (req, res)=>{
    const users = await User.find().select("-password");
    res.status(200).json({users});
})

// get user by mail
router.get("/:email", async (req, res)=>{
    const {email} = req.params;
    const user = await User.findOne({email}).select("-password");
    if(!user){
        return res.status(404).json({message: "User not found"});
    }
    res.status(200).json(user);
})


// login user
router.post("/login", async (req, res)=>{
    const {email, password} = req.body;
    const user = await User.findOne({email})
    if(!user){
        return res.status(400).json({message: "Wrong email or Password"});
    }
    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if(!isPasswordMatch){
        return res.status(400).json({message: "Wrong email or Password"}); 
    }
    const payload = {id: user._id};
    const token = jsonwebtoken.sign(payload, process.env.JWT_SECRET);
    res.status(200).json({token});
})

module.exports =  router;