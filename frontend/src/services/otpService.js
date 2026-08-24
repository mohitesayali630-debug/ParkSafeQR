import axios from "axios";

const BASE_URL = "https://bargiee.microdynamicsoftware.uk/api/otp";

export const sendOTP = async (mobile) => {

    const response = await axios.post(
        `${BASE_URL}/send`,
        {
            mobile,
            source: "web"
        }
    );

    return response.data;
};

export const verifyOTP = async (mobile, otp) => {

    const response = await axios.post(
        `${BASE_URL}/verify`,
        {
            mobile,
            otp,
            source: "web"
        }
    );

    return response.data;
};