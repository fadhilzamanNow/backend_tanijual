const sendShopToken = (user, statusCode, res) => {
    const token = user.getJwtToken();


    // option untuk cookies, nambahin secure sama samesites

    const options = {
        expires : new Date(Date.now() + 90 + 24 * 24 * 60 * 60 * 1000),
        httpOnly : true,
        secure : true,
        sameSite : "none"

    }

    res.status(statusCode).cookie("seller_token", token, options).json({
        success : true,
        user,
        token,
    });
}

module.exports = sendShopToken

