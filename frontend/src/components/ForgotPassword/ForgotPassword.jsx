import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../../config";

import "../../css/ForgotPassword.css";
import logo from "../../assets/images/logo.png";

import {
  FaEnvelope,
  FaMobileAlt,
  FaArrowRight,
  FaArrowLeft,
} from "react-icons/fa";

function ForgotPassword() {
  const navigate = useNavigate();

  const [identifier, setIdentifier] = useState("");
  const [error, setError] = useState("");


const handleSendOTP = async () => {

  const value = identifier.trim();

  if (value === "") {
    setError("Please enter your Email or Mobile Number.");
    return;
  }

  // Email Validation
  const emailRegex =
    /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;

  // Mobile Validation
  const mobileRegex =
    /^[6-9]\d{9}$/;

  if (!emailRegex.test(value) && !mobileRegex.test(value)) {
    setError("Please enter a valid Email or Mobile Number.");
    return;
  }

  setError("");

  try {

    const response = await fetch(
      `${API_BASE_URL}/send-otp/`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          identifier: value,
        }),
      }
    );

    const data = await response.json();

   if (response.ok) {

  navigate("/verify-otp", {
    state: {
      identifier: value,
      email: data.email,
    },
  });

} else {

  setError(data.error);

}

  } catch (err) {

    setError("Server Error");

  }

};
  return (
    <div className="forgot-page">

      <div className="forgot-card">

        {/* Header */}

        <div className="forgot-header">

          <img
            src={logo}
            alt="ParkSafe Logo"
            className="forgot-logo"
          />

          <h1 className="forgot-title">
            Forgot Password
          </h1>

          <p className="forgot-subtitle">
            Recover your account securely
          </p>

        </div>

        {/* Body */}

        <div className="forgot-body">

          {/* Input */}

          <div className="forgot-input-box">

            {identifier.match(/^\d*$/) ? (
              <FaMobileAlt className="forgot-icon" />
            ) : (
              <FaEnvelope className="forgot-icon" />
            )}

            <input
              type="text"
              placeholder="Enter Email or Mobile Number"
              value={identifier}
              onChange={(e) => {
                setIdentifier(e.target.value);
                setError("");
              }}
            />

          </div>

          {/* Error */}

          {error && (
            <p className="forgot-error">
              {error}
            </p>
          )}

          {/* Helper Text */}

          <div className="forgot-helper">

           

            <p>
              We'll send a secure OTP to your registered
              Email or Mobile Number.
            </p>

          </div>

          {/* Send OTP Button */}

          <button
            className="forgot-btn"
            onClick={handleSendOTP}
          >
            <span>Send OTP</span>

            <FaArrowRight className="btn-arrow" />
          </button>

          {/* Back */}

          <div className="back-section">

            <Link
              to="/"
              className="back-login"
            >
              <FaArrowLeft />
              <span>Back to Login</span>
            </Link>

          </div>

        </div>

      </div>

    </div>
  );
}

export default ForgotPassword;