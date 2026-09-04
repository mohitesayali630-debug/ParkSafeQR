import React, {
  useState,
  useEffect,
  useRef,
} from "react";

import {
  Link,
  useNavigate,
  useLocation,
} from "react-router-dom";
import { API_BASE_URL } from "../../config";

import "../../css/VerifyOTP.css";
import logo from "../../assets/images/logo.png";

import {
  FaArrowLeft,
} from "react-icons/fa";

function VerifyOTP() {

  const navigate = useNavigate();
  const location = useLocation();

  const identifier =
    location.state?.identifier ||
    location.state?.mobile ||
    "**********";


  const email =
  location.state?.email || "";

  const [otp, setOtp] = useState(
    new Array(6).fill("")
  );

  const [timer, setTimer] =
    useState(30);

  const [canResend, setCanResend] =
    useState(false);

  const [isVerifying, setIsVerifying] =
    useState(false);

  const [otpError, setOtpError] =
    useState("");

  const inputRefs = useRef([]);

  /* ==========================
            TIMER
  ========================== */

  useEffect(() => {

    if (timer <= 0) {

      setCanResend(true);

      return;

    }

    const interval = setInterval(() => {

      setTimer((prev) => prev - 1);

    }, 1000);

    return () => clearInterval(interval);

  }, [timer]);

  /* ==========================
        VERIFY OTP
  ========================== */
const verifyOTP = async (code) => {

  setIsVerifying(true);

  setOtpError("");

  try {

    const response = await fetch(
      `${API_BASE_URL}/verify-otp/`,
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
        email: email,
        otp: code,
      }),
      }
    );

    const data = await response.json();

    if (response.ok) {

      navigate("/reset-password", {
        state: {
          email: email,
        },
      });

    } else {

      setOtpError(data.error);

      setOtp(new Array(6).fill(""));

      inputRefs.current[0]?.focus();

    }

  } catch (error) {

    setOtpError("Server Error");

  }

  setIsVerifying(false);

};
  

  /* ==========================
        OTP CHANGE
  ========================== */

  const handleChange = (
    value,
    index
  ) => {

    if (!/^\d*$/.test(value))
      return;

    const updatedOTP = [...otp];

    updatedOTP[index] =
      value.slice(-1);

    setOtp(updatedOTP);

    if (
      value &&
      index < 5
    ) {

      inputRefs.current[index + 1]?.focus();

    }

    const otpValue =
      updatedOTP.join("");

    if (
      otpValue.length === 6 &&
      !updatedOTP.includes("")
    ) {

      verifyOTP(otpValue);

    }

  };

  /* ==========================
        BACKSPACE
  ========================== */

  const handleKeyDown = (
    e,
    index
  ) => {

    if (
      e.key === "Backspace" &&
      otp[index] === "" &&
      index > 0
    ) {

      inputRefs.current[index - 1]?.focus();

    }

  };

  /* ==========================
          PASTE OTP
  ========================== */

  const handlePaste = (e) => {

    e.preventDefault();

    const pasted =
      e.clipboardData
        .getData("text")
        .trim()
        .slice(0, 6);

    if (!/^\d+$/.test(pasted))
      return;

    const updatedOTP =
      new Array(6).fill("");

    pasted
      .split("")
      .forEach((digit, index) => {

        updatedOTP[index] =
          digit;

      });

    setOtp(updatedOTP);

    if (pasted.length === 6) {

      verifyOTP(pasted);

    }

  };   
    /* ==========================
        RESEND OTP
  ========================== */

  const handleResend = async () => {

  if (!canResend) return;

  try {

    const response = await fetch(
      `${API_BASE_URL}/resend-otp/`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          identifier: identifier,
        }),
      }
    );

    const data = await response.json();

    if (response.ok) {

      setOtp(new Array(6).fill(""));
      setTimer(30);
      setCanResend(false);
      setOtpError("");
      setIsVerifying(false);

      inputRefs.current[0]?.focus();

      alert(data.message);

    } else {

      alert(data.error);

    }

  } catch (error) {

    alert("Server Error");

  }

};

  /* ==========================
            RETURN
  ========================== */

  return (

    <div className="verify-page">

      <div className="verify-card">

        {/* Logo */}

        <img
          src={logo}
          alt="ParkSafe"
          className="verify-logo"
        />

        {/* Title */}

        <h1 className="verify-title">
          Verify OTP
        </h1>

        <p className="verify-subtitle">
          Verify your identity securely
        </p>

        <p className="verify-text">
          OTP has been sent to
        </p>

        <h4 className="verify-identifier">
          {identifier}
        </h4>

        {/* OTP */}

        <div
          className="otp-container"
          onPaste={handlePaste}
        >

          {

            otp.map((digit, index) => (

              <input

                key={index}

                ref={(element) =>
                  inputRefs.current[index] = element
                }

                type="text"

                maxLength="1"

                className={
                  otpError
                    ? "otp-input otp-error"
                    : "otp-input"
                }

                value={digit}

                onChange={(e) =>
                  handleChange(
                    e.target.value,
                    index
                  )
                }

                onKeyDown={(e) =>
                  handleKeyDown(
                    e,
                    index
                  )
                }

              />

            ))

          }

        </div>

        {

          otpError &&

          <p className="otp-error-text">

            {otpError}

          </p>

        }

        {

          isVerifying &&

          <div className="verify-loading">

            <div className="loader"></div>

            <span>

              Verifying OTP...

            </span>

          </div>

        }

        {/* Timer */}

        <div className="timer-section">

          <p>

            Time Remaining

          </p>

          <h3>

            00:

            {

              timer < 10

                ? `0${timer}`

                : timer

            }

          </h3>

        </div>

        {/* Resend */}

        <div className="resend-section">

          <p>

            Didn't receive the OTP?

          </p>

          <button

            className={
              canResend
                ? "resend-btn active"
                : "resend-btn"
            }

            disabled={!canResend}

            onClick={handleResend}

          >

            Resend OTP

          </button>

        </div>

        
        {/* Back */}

        <Link

              to="/forgot-password"

              className="back-link"

            >

              <FaArrowLeft />

              Back

            </Link>
      </div>

    </div>

  );

}

export default VerifyOTP;