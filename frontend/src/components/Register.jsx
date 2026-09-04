import React, { useEffect, useState } from "react";
import { sendOTP } from "../services/otpService";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { API_BASE_URL } from "../config";
import "../css/Register.css";

import logo from "../assets/images/logo.png";

import {
    FaUser,
    FaPhone,
    FaEnvelope,
    FaLock,
    FaEye,
    FaEyeSlash,
    FaArrowRight,
    FaArrowLeft,
    FaCar,
    FaTint,
    FaHeartbeat,
    FaPlus
} from "react-icons/fa";

function Register() {

    const navigate = useNavigate();

    const location = useLocation();

    /* ==========================
          Steps
    ========================== */

    const [step, setStep] = useState(1);

    useEffect(() => {

        if (location.state?.step === 2) {

            setStep(2);


            if (location.state?.formData) {

                console.log(
                    "STEP 1 DATA RECEIVED ON STEP 2:",
                    location.state.formData
                );


                setFormData(location.state.formData);

            }

            // state clear
            navigate("/register", {
                replace: true,
                state: {}
            });

        }

    }, [location, navigate]);

    /* ==========================
          Form Data
  ========================== */

    const [formData, setFormData] = useState({
        full_name: "",
        mobile_number: "",
        email: "",
        password: "",
        confirm_password: "",
        privacy: "private",
        vehicle_number: "",
        blood_group: "",
        medical_condition: "None",
    });

    /* ==========================
            Form Errors
    ========================== */

    const [errors, setErrors] = useState({});

    /* ==========================
          Handle Input Change
    ========================== */

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };
    /* ==========================
          Form Validation
    ========================== */

    const validateForm = () => {

        let newErrors = {};

        // Full Name Validation

        const name = formData.full_name.trim();

        // Empty
        if (name === "") {
            newErrors.full_name = "Full Name is required";
        }

        // Only letters and spaces
        else if (!/^[A-Za-z ]+$/.test(name)) {
            newErrors.full_name = "Only letters are allowed";
        }

        // Multiple spaces remove
        else {
            const words = name.split(/\s+/);

            // At least 2 words
            if (words.length < 2) {
                newErrors.full_name = "Enter First and Last Name";
            }

            // Every word should contain minimum 2 letters
            else if (words.some(word => word.length < 2)) {
                newErrors.full_name = "Each name must contain at least 2 letters";
            }

            // Total letters only (without spaces)
            else if (name.replace(/\s/g, "").length < 5) {
                newErrors.full_name = "Enter a valid full name";
            }
        }

        // Mobile Number Validation

        if (formData.mobile_number.trim() === "") {

            newErrors.mobile_number = "Mobile Number is required";

        }

        else if (!/^[0-9]+$/.test(formData.mobile_number.trim())) {

            newErrors.mobile_number = "Only numbers are allowed";

        }

        else if (formData.mobile_number.length !== 10) {

            newErrors.mobile_number = "Mobile Number must be 10 digits";

        }

        else if (!/^[6-9]/.test(formData.mobile_number)) {

            newErrors.mobile_number =
                "Mobile Number must start with 6, 7, 8 or 9";

        }

        // Email Validation

        if (formData.email.trim() === "") {

            newErrors.email = "Email is required";

        }

        else {

            const emailRegex =
                /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;

            if (!emailRegex.test(formData.email.trim())) {

                newErrors.email = "Enter a valid email address";

            }

        }
        // Password Validation

        if (formData.password.trim() === "") {

            newErrors.password = "Password is required";

        }

        else if (formData.password.length < 8) {

            newErrors.password = "Password must be at least 8 characters";

        }

        else if (!/[A-Z]/.test(formData.password)) {

            newErrors.password = "At least one uppercase letter is required";

        }

        else if (!/[a-z]/.test(formData.password)) {

            newErrors.password = "At least one lowercase letter is required";

        }

        else if (!/[0-9]/.test(formData.password)) {

            newErrors.password = "At least one number is required";

        }

        else if (!/[!@#$%^&*(),.?":{}|<>]/.test(formData.password)) {

            newErrors.password = "At least one special character is required";

        }
        // Confirm Password Validation

        if (formData.confirm_password.trim() === "") {

            newErrors.confirm_password = "Confirm Password is required";

        }

        else if (formData.password !== formData.confirm_password) {

            newErrors.confirm_password = "Passwords do not match";

        }
        // Vehicle Number Validation

        if (step === 2) {

            if (formData.vehicle_number.trim() === "") {

                newErrors.vehicle_number = "Vehicle Number is required";

            }

            else if (
                !/^[A-Z]{2}[0-9]{2}[A-Z]{1,2}[0-9]{4}$/.test(
                    formData.vehicle_number.replace(/\s+/g, "").toUpperCase()
                )
            ) {

                newErrors.vehicle_number =
                    "Enter a valid vehicle number (Example: MH12AB1234)";

            }

        }
        // Blood Group Validation

        if (step === 2) {

            if (formData.blood_group === "") {

                newErrors.blood_group = "Please select your blood group";

            }

        }
        // Emergency Contact Validation
        if (step == 2) {
            contacts.forEach((contact, index) => {

                if (contact.name.trim() === "") {

                    newErrors[`contact_name_${index}`] =
                        "Emergency Contact Name is required";

                }

            });
            contacts.forEach((contact, index) => {

                if (contact.number.trim() === "") {

                    newErrors[`contact_number_${index}`] =
                        "Emergency Contact Number is required";

                }

                else if (!/^[6-9]\d{9}$/.test(contact.number)) {

                    newErrors[`contact_number_${index}`] =
                        "Enter a valid 10-digit mobile number";

                }

            });
        }
        setErrors(newErrors);

        return Object.keys(newErrors).length === 0;
    };
    /* ==========================
          Handle Submit
    ========================== */

    const handleSubmit = async (e) => {

        if (e) {
            e.preventDefault();
        }

        if (!validateForm()) {
            return;
        }

        try {

            const response = await axios.post(
                `${API_BASE_URL}/register/`,
                {
                    ...formData,

                    // +91 सोबत नंबर Backend ला पाठव
                    mobile_number: `+91${formData.mobile_number}`,

                    contacts: contacts,
                }
            );

            console.log(response.data);

            if (response.data?.id) {
                localStorage.setItem("parksafe_user", JSON.stringify(response.data));
            }

            alert("Registration Successful ✅");

            navigate("/generate-qr", {
                state: {
                    userId: response.data?.id,
                    ownerName: response.data?.full_name || formData.full_name,
                    vehicleNumber: response.data?.vehicle_number || formData.vehicle_number,
                    mobile: response.data?.mobile_number || formData.mobile_number,
                }
            });

        }
        catch (error) {

            console.log("Full Error :", error);

            console.log("Response :", error.response);

            console.log("Data :", error.response?.data);

            console.log("Status :", error.response?.status);

            const errorData = error.response?.data;

            // Mobile number already exists
            if (errorData?.mobile_number) {

                alert(
                    "Registration Failed ❌\n\n" +
                    errorData.mobile_number[0]
                );

            }

            // Other backend error
            else if (errorData?.detail) {

                alert(
                    "Registration Failed ❌\n\n" +
                    errorData.detail
                );

            }

            // Unknown error
            else {

                alert(
                    "Registration Failed ❌\n\n" +
                    "Something went wrong. Please try again."
                );

            }

        }

    };
    /* ==========================
          Password
    ========================== */

    const [showPassword, setShowPassword] = useState(false);

    const [showConfirmPassword, setShowConfirmPassword] = useState(false);



    /* ==========================
          Emergency Contacts
    ========================== */

    const [contacts, setContacts] = useState([
        {
            name: "",
            number: ""
        }
    ]);

    const addContact = () => {

        setContacts([
            ...contacts,
            {
                name: "",
                number: ""
            }
        ]);

    };

    const updateContact = (index, field, value) => {

        const updated = [...contacts];

        updated[index][field] = value;

        setContacts(updated);

    };

    return (

        <div className="register-page">

            <div className="register-card">

                {/* ======================
                Header
        ======================= */}

                <div className="register-header">

                    <img
                        src={logo}
                        alt="ParkSafe"
                        className="logo"
                    />

                    <h2 className="register-title">
                        Create Account
                    </h2>

                    <p className="register-text">
                        Create your ParkSafe QR account
                    </p>

                </div>

                {/* ======================
              Register Body
        ======================= */}

                <div className="register-body">
                    {/* ==========================
        STEP 1
========================== */}

                    {step === 1 && (

                        <>

                            <div className="mb-name">

                                <div className="input-box">

                                    <FaUser className="input-icon" />

                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="Full Name"
                                        name="full_name"
                                        value={formData.full_name}
                                        onChange={handleChange}
                                    />

                                </div>

                                <span className="error-text">
                                    {errors.full_name}
                                </span>

                            </div>


                            <div className="mb-contact">

                                <div className="input-box phone-input-box">

                                    <FaPhone className="input-icon" />

                                    <div className="country-code">
                                        +91
                                    </div>

                                    <input
                                        type="text"
                                        name="mobile_number"
                                        className="form-control phone-input"
                                        placeholder="Mobile Number"
                                        maxLength="10"
                                        value={formData.mobile_number}
                                        onChange={(e) => {

                                            const value = e.target.value.replace(/\D/g, "");

                                            setFormData({
                                                ...formData,
                                                mobile_number: value
                                            });

                                        }}
                                    />

                                </div>

                                {errors.mobile_number && (

                                    <span className="error-text">

                                        {errors.mobile_number}

                                    </span>

                                )}

                            </div>

                            <div className="mb-email">

                                <div className="input-box">

                                    <FaEnvelope className="input-icon" />

                                    <input
                                        type="email"
                                        name="email"
                                        className="form-control"
                                        placeholder="Email Address"
                                        value={formData.email}
                                        onChange={handleChange}
                                    />

                                </div>

                                {errors.email && (
                                    <span className="error-text">
                                        {errors.email}
                                    </span>
                                )}

                            </div>


                            <div className="mb-password">

                                <div className="input-box">

                                    <FaLock className="input-icon" />

                                    <input
                                        type={showPassword ? "text" : "password"}
                                        name="password"
                                        className="form-control"
                                        placeholder="Password"
                                        value={formData.password}
                                        onChange={handleChange}
                                    />

                                    {
                                        showPassword ?

                                            <FaEyeSlash
                                                className="eye-icon"
                                                onClick={() => setShowPassword(false)}
                                            />

                                            :

                                            <FaEye
                                                className="eye-icon"
                                                onClick={() => setShowPassword(true)}
                                            />
                                    }

                                </div>

                                <span className="error-text">
                                    {errors.password}
                                </span>

                            </div>


                            <div className="mb-confirm-password">

                                <div className="input-box">

                                    <FaLock className="input-icon" />

                                    <input
                                        type={showConfirmPassword ? "text" : "password"}
                                        name="confirm_password"
                                        className="form-control"
                                        placeholder="Confirm Password"
                                        value={formData.confirm_password}
                                        onChange={handleChange}
                                    />

                                    {
                                        showConfirmPassword ?

                                            <FaEyeSlash
                                                className="eye-icon"
                                                onClick={() => setShowConfirmPassword(false)}
                                            />

                                            :

                                            <FaEye
                                                className="eye-icon"
                                                onClick={() => setShowConfirmPassword(true)}
                                            />
                                    }

                                </div>

                                <span className="error-text">
                                    {errors.confirm_password}
                                </span>

                            </div>


                            <button

                                className="btn btn-primary next-btn"

                                onClick={async () => {

                                    if (!validateForm()) return;

                                    try {

                                        const fullNumber = `91${formData.mobile_number}`;

                                        const response = await sendOTP(fullNumber);

                                        console.log(response);

                                        alert("OTP Sent Successfully ✅");

                                        navigate("/otp", {
                                            state: {
                                                mobile: fullNumber,
                                                formData: formData
                                            }
                                        });

                                    }

                                    catch (error) {

                                        console.log(error);

                                        alert("Failed to Send OTP ❌");

                                    }

                                }}

                            >

                                Next

                                <FaArrowRight className="ms-2" />

                            </button>

                        </>

                    )}
                    {/* ==========================
        STEP 2
========================== */}

                    {step === 2 && (

                        <>

                            <div className="mb-vehicle">

                                <div className="input-box">

                                    <FaCar className="input-icon" />

                                    <input
                                        type="text"
                                        name="vehicle_number"
                                        className="form-control"
                                        placeholder="Vehicle Number (MH12AB1234)"
                                        value={formData.vehicle_number}
                                        onChange={(e) => {
                                            const value = e.target.value.toUpperCase();

                                            setFormData((prevData) => ({
                                                ...prevData,
                                                vehicle_number: value
                                            }));
                                        }}
                                    />

                                </div>

                                <span className="error-text">
                                    {errors.vehicle_number}
                                </span>

                            </div>


                            <div className="mb-blood">

                                <div className="input-box">

                                    <FaTint className="input-icon" />

                                    <select
                                        className="form-control"
                                        name="blood_group"
                                        value={formData.blood_group}
                                        onChange={handleChange}
                                    >

                                        <option value="" disabled>
                                            Select Blood Group
                                        </option>

                                        <option value="A+">A+</option>
                                        <option value="A-">A-</option>
                                        <option value="B+">B+</option>
                                        <option value="B-">B-</option>
                                        <option value="AB+">AB+</option>
                                        <option value="AB-">AB-</option>
                                        <option value="O+">O+</option>
                                        <option value="O-">O-</option>

                                    </select>

                                </div>

                                <span className="error-text">
                                    {errors.blood_group}
                                </span>

                            </div>
                            <div className="mb-medical">

                                <div className="input-box">

                                    <FaHeartbeat className="input-icon" />

                                    <select
                                        className="form-control"
                                        name="medical_condition"
                                        value={formData.medical_condition}
                                        onChange={handleChange}
                                    >

                                        <option value="None">None</option>
                                        <option value="Diabetes">Diabetes</option>
                                        <option value="Blood Pressure">Blood Pressure</option>
                                        <option value="Heart Patient">Heart Patient</option>
                                        <option value="Asthma">Asthma</option>
                                        <option value="Epilepsy">Epilepsy</option>
                                        <option value="Allergy">Allergy</option>
                                        <option value="Pregnant">Pregnant</option>
                                        <option value="Other">Other</option>

                                    </select>

                                </div>

                            </div>


                            <h5 className="section-title">
                                Emergency Contacts
                            </h5>

                            {contacts.map((contact, index) => (

                                <div className="contact-card" key={index}>

                                    <h6 className="contact-title">
                                        Emergency Contact {index + 1}
                                    </h6>

                                    {/* Contact Name */}

                                    <div className="mb-contact-name">

                                        <div className="input-box">

                                            <FaUser className="input-icon" />

                                            <input
                                                type="text"
                                                className="form-control"
                                                placeholder="Emergency Contact Name"
                                                value={contact.name}
                                                onChange={(e) =>
                                                    updateContact(index, "name", e.target.value)
                                                }
                                            />

                                        </div>

                                        <span className="error-text">
                                            {errors[`contact_name_${index}`]}
                                        </span>

                                    </div>

                                    {/* Contact Number */}

                                    <div className="mb-contact-number">

                                        <div className="input-box">

                                            <FaPhone className="input-icon" />

                                            <input
                                                type="text"
                                                className="form-control"
                                                placeholder="Emergency Contact Number"
                                                value={contact.number}
                                                onChange={(e) =>
                                                    updateContact(index, "number", e.target.value)
                                                }
                                            />

                                        </div>

                                        <span className="error-text">
                                            {errors[`contact_number_${index}`]}
                                        </span>

                                    </div>

                                </div>

                            ))}

                            <button
                                type="button"
                                className="add-contact-btn"
                                onClick={addContact}
                            >

                                <FaPlus className="me-2" />

                                Add Another Contact

                            </button>



                            <div className="button-group">


                                <button
                                    type="button"
                                    className="generate-btn"
                                    onClick={handleSubmit}
                                >
                                    Submit
                                </button>
                            </div>

                        </>

                    )}

                </div>

            </div>

        </div>

    );

}

export default Register;