const sendToken = (user, statusCode, res) => {
    const token = user.getJwtToken();


    // option untuk cookies

    const options = {
        expires : new Date(Date.now() + 90 + 24 * 24 * 60 * 60 * 1000),
        secure : true,
        httpOnly : true,
        sameSite: "none",
        
    }

    res.status(statusCode).cookie("token", token, options).json({
        success : true,
        user,
        token,
    });
}

module.exports = sendToken

