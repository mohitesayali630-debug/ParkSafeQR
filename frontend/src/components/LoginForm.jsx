import React, { useState } from "react";
import "../css/Login.css";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../config";

import logo from "../assets/images/logo.png";
import car from "../assets/images/car.png";

import { FaUser, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";

function LoginForm() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
 const handleLogin = async () => {

    if (email === "") {
        alert("Please enter your Email or Mobile Number");
        return;
    }

    if (password === "") {
        alert("Please enter your Password");
        return;
    }

    try {

        const response = await fetch(
            `${API_BASE_URL}/login/`,
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json",
                },

                body: JSON.stringify({
                    identifier: email,
                    password: password,
                }),
            }
        );

        console.log(response.status);
        const data = await response.json();

        console.log(data);

        

        if (response.ok) {

            if (data.user_id) {
                localStorage.setItem("parksafe_user", JSON.stringify(data));
            }

            alert(data.message);

            
             navigate("/dashboard");

        } else {

            alert(data.error);

        }

    } 
    catch (error) {

    console.error("Login Error:", error);

    alert("Server Error: " + error.message);

}

};
  return (
    <div className="login-page">
      <div className="login-card">

        <div className="login-header">
          <img src={logo} alt="Logo" className="logo" />

          <h2 className="welcome-title">Welcome Back!</h2>

          <p className="welcome-text">
            Login to your account
          </p>

          <img src={car} alt="Car" className="car" />
        </div>

        <div className="login-body">

          {/* Email */}
          <div className="input-box mb-3">
            <FaUser className="input-icon" />

            <input
                type="text"
                className="form-control"
                placeholder="Email or Mobile Number"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          {/* Password */}
          <div className="input-box mb-3">
            <FaLock className="input-icon" />

           <input
                 type={showPassword ? "text" : "password"}
                 className="form-control"
                 placeholder="Password"
                 value={password}
                 onChange={(e) => setPassword(e.target.value)}
            />

            {
               showPassword ? (
                 <FaEyeSlash
                    className="eye-icon"
                    onClick={() => setShowPassword(false)}
                 />
                 ) : (
                 <FaEye
                  className="eye-icon"
                  onClick={() => setShowPassword(true)}
                 />
                )
               }
          </div>

          <div className="d-flex justify-content-between align-items-center mb-3">

            <div>
              <input type="checkbox" id="remember" />
              <label htmlFor="remember" className="ms-2">
                Remember Me
              </label>
            </div>

            <Link to="/forgot-password" className="forgot-link">
                Forgot Password?
            </Link>

          </div>

          <button
              className="btn btn-primary login-btn"
              onClick={handleLogin}
                >
               Login
          </button>
          <div className="text-center mt-3">

            
            <p className="mt-3">
              Don't have an account?
              <Link to="/register" className="register-link">
                         Register
              </Link>
            </p>

          </div>

        </div>

      </div>
    </div>
  );
}

export default LoginForm;