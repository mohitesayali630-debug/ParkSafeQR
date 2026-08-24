import React, { useState, useEffect } from "react";

import { useNavigate, useLocation } from "react-router-dom";

import "../../css/ResetPassword.css";

import logo from "../../assets/images/logo.png";

import {
  FaLock,
  FaEye,
  FaEyeSlash,
  FaCheckCircle
} from "react-icons/fa";

function ResetPassword() {

  const navigate = useNavigate();

  const location = useLocation();

  const email =
  location.state?.email || "";

  const [newPassword, setNewPassword] =
    useState("");

  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [showNewPassword, setShowNewPassword] =
    useState(false);

  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  const [passwordError, setPasswordError] = useState("");

  const [confirmPasswordError, setConfirmPasswordError] = useState("");

  /* ===========================
        PASSWORD VALIDATION
  =========================== */

  const passwordRules = {

    length: newPassword.length >= 8,

    uppercase: /[A-Z]/.test(newPassword),

    lowercase: /[a-z]/.test(newPassword),

    number: /[0-9]/.test(newPassword),

    special:
      /[!@#$%^&*(),.?":{}|<>]/.test(newPassword),

  };

  const validatePassword = () => {

  setPasswordError("");
  setConfirmPasswordError("");

  if (!passwordRules.length) {
    setPasswordError("Password must be at least 8 characters.");
    return false;
  }

  if (!passwordRules.uppercase) {
    setPasswordError("Password must contain at least one uppercase letter.");
    return false;
  }

  if (!passwordRules.lowercase) {
    setPasswordError("Password must contain at least one lowercase letter.");
    return false;
  }

  if (!passwordRules.number) {
    setPasswordError("Password must contain at least one number.");
    return false;
  }

  if (!passwordRules.special) {
    setPasswordError("Password must contain at least one special character.");
    return false;
  }

  if (confirmPassword === "") {
    setConfirmPasswordError("Please confirm your password.");
    return false;
  }

  if (newPassword !== confirmPassword) {
    setConfirmPasswordError("Passwords do not match.");
    return false;
  }

  return true;

};
 
useEffect(() => {

    // सुरुवातीला काहीही typed नसेल तर error दाखवू नको
    if (newPassword === "") {
        setPasswordError("");
        return;
    }

    if (newPassword.length < 8) {
        setPasswordError("Password must be at least 8 characters.");
    }

    else if (!/[A-Z]/.test(newPassword)) {
        setPasswordError("Password must contain at least one uppercase letter.");
    }

    else if (!/[a-z]/.test(newPassword)) {
        setPasswordError("Password must contain at least one lowercase letter.");
    }

    else if (!/[0-9]/.test(newPassword)) {
        setPasswordError("Password must contain at least one number.");
    }

    else if (!/[!@#$%^&*(),.?\":{}|<>]/.test(newPassword)) {
        setPasswordError("Password must contain at least one special character.");
    }

    else {
        setPasswordError("");
    }

}, [newPassword]);

useEffect(() => {

    if (confirmPassword === "") {
        setConfirmPasswordError("");
        return;
    }

    if (newPassword !== confirmPassword) {

        setConfirmPasswordError("Passwords do not match.");

    }

    else {

        setConfirmPasswordError("");

    }

}, [confirmPassword, newPassword]);


  /* ===========================
        RESET PASSWORD
  =========================== */

 const handleResetPassword = async () => {

    if (!validatePassword()) return;

    setLoading(true);

    try {

        const response = await fetch(
            "http://127.0.0.1:8000/api/reset-password/",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json",
                },

                body: JSON.stringify({
                    email: email,
                    password: newPassword,
                }),
            }
        );

        const data = await response.json();

        if (response.ok) {

            alert("Password Reset Successfully ✅");

            navigate("/");

        } else {

            alert(data.error);

        }

    } catch (error) {

        alert("Server Error");

    }

    setLoading(false);

};
    return (

    <div className="reset-page">

      <div className="reset-card">

        {/* Logo */}

        <img
          src={logo}
          alt="ParkSafe"
          className="reset-logo"
        />

        {/* Title */}

        <h1 className="reset-title">
          Reset Password
        </h1>

        <p className="reset-subtitle">
          Create a new secure password for your account.
        </p>

        {/* New Password */}

        <div className="password-box">

          <FaLock className="input-icon" />

          <input

            type={
              showNewPassword
                ? "text"
                : "password"
            }

            placeholder="New Password"

            value={newPassword}

            onChange={(e) =>
              setNewPassword(e.target.value)
            }

          />

          {

            showNewPassword ?

            <FaEyeSlash

              className="eye-icon"

              onClick={() =>
                setShowNewPassword(false)
              }

            />

            :

            <FaEye

              className="eye-icon"

              onClick={() =>
                setShowNewPassword(true)
              }

            />

          }

        </div>
        {passwordError && (
              <p className="password-error">
                  {passwordError}
              </p>
          )}

        {/* Confirm Password */}

        {/* Confirm Password */}

<div className="confirm-password-section">

    <div className="password-box">

        <FaLock className="input-icon" />

        <input
            type={
                showConfirmPassword
                    ? "text"
                    : "password"
            }

            placeholder="Confirm Password"

            value={confirmPassword}

            onChange={(e) =>
                setConfirmPassword(e.target.value)
            }
        />

        {
            showConfirmPassword ?

            <FaEyeSlash
                className="eye-icon"
                onClick={() =>
                    setShowConfirmPassword(false)
                }
            />

            :

            <FaEye
                className="eye-icon"
                onClick={() =>
                    setShowConfirmPassword(true)
                }
            />
        }

    </div>

    {confirmPasswordError && (
        <p className="password-error">
            {confirmPasswordError}
        </p>
    )}

</div>
        {/* Reset Button */}

        <button

          className="reset-btn"

          onClick={handleResetPassword}

          disabled={loading}

        >

          {

            loading

            ?

            "Resetting..."

            :

            "Reset Password"

          }

        </button>

      </div>

    </div>

  );

}

export default ResetPassword;