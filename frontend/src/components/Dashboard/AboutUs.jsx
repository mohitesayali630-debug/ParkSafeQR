import React from "react";
import {
  FaArrowLeft,
  FaCarSide,
  FaShieldAlt,
  FaQrcode,
} from "react-icons/fa";

import "../../css/Dashboard/AboutUs.css";

function AboutUs() {

  const handleBack = () => {
    window.location.href = "/dashboard";
  };

  return (
    <div className="about-page">

      <div className="about-card">

        {/* HEADER */}

        <div className="about-header">

          <button
            type="button"
            className="about-back-button"
            onClick={handleBack}
          >
            <FaArrowLeft />
          </button>

          <h1>About Us</h1>

          <div className="about-header-space"></div>

        </div>


        {/* CONTENT */}

        <div className="about-content">

          {/* LOGO / ICON */}

          <div className="about-main-icon">
            <FaCarSide />
          </div>

          <h2>ParkSafe QR</h2>

          <p className="about-description">
            A smart vehicle safety system designed to
            make vehicle information and emergency
            communication easier.
          </p>


          {/* OUR MISSION */}

          <div className="about-box">

            <div className="about-box-heading">
              <span></span>
              Our Mission
            </div>

            <p>
              To make vehicle identification,
              emergency communication and parking
              safety easier, faster and more reliable.
            </p>

          </div>


          {/* HOW IT HELPS */}

          <div className="about-box">

            <div className="about-box-heading">
              <span></span>
              How ParkSafe QR Helps
            </div>

            <div className="about-feature">

              <div className="about-feature-icon">
                <FaQrcode />
              </div>

              <div>
                <h3>QR Safety</h3>

                <p>
                  Important vehicle and emergency
                  information can be accessed through
                  your ParkSafe QR.
                </p>
              </div>

            </div>


            <div className="about-feature">

              <div className="about-feature-icon">
                <FaShieldAlt />
              </div>

              <div>
                <h3>Vehicle Safety</h3>

                <p>
                  Keep your vehicle and emergency
                  details organized in one place.
                </p>
              </div>

            </div>

          </div>


          {/* FOOTER */}

          <div className="about-footer">
            Smart Vehicle. Safe Parking.
          </div>

        </div>

      </div>

    </div>
  );
}

export default AboutUs;