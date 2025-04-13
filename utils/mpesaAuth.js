const axios = require("axios");
require("dotenv").config();

const getMpesaToken = async () => {
    const auth = Buffer.from(`${process.env.MPESA_CONSUMER_KEY}:${process.env.MPESA_CONSUMER_SECRET}`).toString("base64");
    
    try {
        const response = await axios.get("https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials", {
            headers: {
                Authorization: `Basic ${auth}`,
            },
        });
        return response.data.access_token;
    } catch (error) {
        console.error("M-Pesa Token Error:", error.response?.data || error.message);
        throw new Error("Failed to get M-Pesa token");
    }
};

module.exports = getMpesaToken;
