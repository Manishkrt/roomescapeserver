import axios from "axios";
import crypto from "crypto";
import dotenv from "dotenv";

dotenv.config();

// const PHONEPE_BASE_URL = "https://api.phonepe.com/apis/hermes"; // Use correct PhonePe API
const  BASE_URL = "https://api.phonepe.com/apis/hermes/pg/v1/pay"; // Use correct PhonePe API
// const  BASE_URL = " https://api-preprod.phonepe.com/apis/pg-sandbox"; // Use correct PhonePe API
const MERCHANT_ID = process.env.PHONEPE_MERCHANT_ID;
const SALT_KEY = process.env.PHONEPE_SALT_KEY;
const SALT_INDEX = 1; // Default salt index




export const PhonePeService2 = {
  async initiatePayment(amount, phone, transactionId) {
    try {
      const payload = {
        merchantId: MERCHANT_ID,
        transactionId: transactionId,
        amount: amount * 100, // Convert to paisa
        mobileNumber: phone,
        callbackUrl: `${process.env.BACKEND_URL}/api/v1/booking/phone-pay/callback`,
        paymentInstrument: {
          type: "UPI_INTENT"
        }
      };

      // Convert payload to base64
      const base64Payload = Buffer.from(JSON.stringify(payload)).toString("base64");

      // Generate SHA256 hash
      const checksum = crypto.createHash("sha256").update(base64Payload + SALT_KEY).digest("hex");

      // Final X-VERIFY header value
      const xVerify = `${checksum}###${SALT_INDEX}`;

      // Make API request
      const response = await axios.post(PHONEPE_BASE_URL, { request: base64Payload }, {
        headers: {
          "Content-Type": "application/json",
          "X-VERIFY": xVerify,
          "X-MERCHANT-ID": MERCHANT_ID
        }
      });

      return response.data;
    } catch (error) {
      console.error("PhonePe Payment Error:", error.message);
      return { success: false, error: error.response?.data || "Payment error" };
    }
  }
};
 

  
export const PhonePeService = {
  async initiatePayment(amount, phone) {
    console.log("MERCHANT_ID", MERCHANT_ID, "SALT_KEY", SALT_KEY );
    try {
      const payload = {
        merchantId: MERCHANT_ID,
        amount: amount * 100, // Convert to paise
        phone,
        callbackUrl: `${process.env.BACKEND_URL}/api/v1/booking/phone-pay/callback`,
      };

      // Convert payload to Base64
      const base64Payload = Buffer.from(JSON.stringify(payload)).toString("base64");

      // Generate SHA256 checksum (HMAC)
      const checksum = crypto.createHmac("sha256", SALT_KEY).update(base64Payload + "/pg/v1/pay" + SALT_KEY).digest("hex");

      // Construct API request
      const response = await axios.post(BASE_URL, 
        { request: base64Payload }, 
        {
          headers: {
            "Content-Type": "application/json",
            "X-VERIFY": `${checksum}###${SALT_INDEX}`, // Authentication header
            "X-MERCHANT-ID": MERCHANT_ID,
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error("PhonePe Payment Error:", error.response?.data , error.message);
      return { success: false, error: error.response?.data || error.message  , errormessage : error.message };
    }
  },
};

// export default PhonePeService;

