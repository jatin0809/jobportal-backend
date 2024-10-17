const dotenv = require("dotenv");
dotenv.config();

const isAuth = (req)=>{
    const token = req.headers.authorization;
    if(!token){
        return false;
    }
    try {
        return true;
    } catch (error) {
        return false;
    }
}

module.exports = isAuth;