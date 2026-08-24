import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { verifyOTP, sendOTP } from "../../services/otpService";
import "../../css/OTPVerification.css";
import logo from "../../assets/images/logo.png";

function OTPVerification() {

    const navigate = useNavigate();
    const location = useLocation();

    const mobile = location.state?.mobile || "";

    const formData = location.state?.formData || {};

    console.log("STEP 1 DATA ON OTP PAGE:", formData);

    const [otp, setOtp] = useState(["", "", "", "", "", ""]);

    const inputRefs = useRef([]);

    const [timer, setTimer] = useState(30);
    const [resendEnabled, setResendEnabled] = useState(false);

    useEffect(() => {

        if (timer > 0) {

            const interval = setInterval(() => {

                setTimer((prev) => prev - 1);

            }, 1000);

            return () => clearInterval(interval);

        }

        else {

            setResendEnabled(true);

        }

    }, [timer]);

    const handleOTPChange = async (value, index) => {

    if (!/^[0-9]?$/.test(value)) return;

    const newOTP = [...otp];

    newOTP[index] = value;

    setOtp(newOTP);

    // Move to next OTP box
    if (value !== "" && index < 5) {
        inputRefs.current[index + 1].focus();
    }

    // ==============================
    // AUTO VERIFY AFTER 6TH DIGIT
    // ==============================

    if (index === 5 && value !== "") {

        const enteredOTP = newOTP.join("");

        if (enteredOTP.length !== 6) {
            return;
        }

        try {

              await verifyOTP(
                mobile,
                enteredOTP
            );


            // Go directly to Step 2
            navigate("/register", {
                state: {
                    step: 2,
                    formData: formData
                }
            });

        } catch (error) {

            console.log("OTP Verification Error:", error);

            alert("Invalid OTP ❌");

            // Clear OTP for retry
            setOtp(["", "", "", "", "", ""]);

            inputRefs.current[0]?.focus();
        }
    }

};

    const handleKeyDown = (e, index) => {

        if (
            e.key === "Backspace" &&
            otp[index] === "" &&
            index > 0
        ) {

            inputRefs.current[index - 1].focus();

        }

    };

  const handleResend = async () => {

    try {

        await sendOTP(mobile);

        setOtp(["", "", "", "", "", ""]);

        setTimer(30);

        setResendEnabled(false);

        inputRefs.current[0]?.focus();

        alert("OTP Sent Successfully ✅");

    }

    catch (error) {

        console.log(error);

        alert("Failed to send OTP ❌");

    }

};

    return (

        <div className="otp-page">

            <div className="otp-card">

                <img
                    src={logo}
                    alt="ParkSafe"
                    className="otp-logo"
                />

                <h2 className="otp-title">

                    OTP Verification

                </h2>

                <p className="otp-text">

                    Enter the 6-digit OTP sent to

                    <b>{mobile}</b>

                </p>

                <div className="otp-container">

                    {otp.map((digit, index) => (

                        <input

                            key={index}

                            ref={(el) => (inputRefs.current[index] = el)}

                            className="otp-input"

                            type="text"

                            maxLength="1"

                            value={digit}

                            onChange={(e) =>
                                handleOTPChange(e.target.value, index)
                            }

                            onKeyDown={(e) =>
                                handleKeyDown(e, index)
                            }

                        />

                    ))}

                </div>

                <div className="timer-container">

                    {

                        timer > 0 ?

                            <p className="timer-text">

                                00:{timer < 10 ? `0${timer}` : timer}

                            </p>

                            :

                            <button

                                className="resend-btn"

                                onClick={handleResend}

                                disabled={!resendEnabled}

                            >

                                Resend OTP

                            </button>

                    }

                </div>

                <div className="otp-button-group">

                        <button 
                            className="back-link" 
                            onClick={() => navigate("/register")} 
                        >
                            <span style={{marginRight:"6px"}}>↩</span>
                            Back to Registration
                        </button>
                </div>

            </div>

        </div>

    );

}

export default OTPVerification;