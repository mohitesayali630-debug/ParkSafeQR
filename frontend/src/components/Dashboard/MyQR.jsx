import React from "react";
import { useNavigate } from "react-router-dom";
import QRCode from "react-qr-code";
import { getPublicVehicleUrl } from "../../config";

import "../../css/Dashboard/MyQR.css";

import {
  FaQrcode,
  FaDownload,
  FaPrint,
} from "react-icons/fa";

function MyQR() {
  const navigate = useNavigate();

  // Registered user information
  const storedUser = JSON.parse(
    localStorage.getItem("parksafe_user") || "{}"
  );

  const userId =
    storedUser.user_id ||
    storedUser.id ||
    1;

  const vehicleNumber =
    storedUser.vehicle_number ||
    storedUser.vehicleNumber ||
    "";

  /*
    IMPORTANT:

    This is the SAME QR URL structure used
    in GenerateQR.jsx after registration.

    So My QR page is NOT generating a
    different/random QR code.
  */
  const qrData = getPublicVehicleUrl(userId);

  // ================= DOWNLOAD QR =================

  const downloadQR = () => {
    const svg = document.getElementById("myParkSafeQR");

    if (!svg) {
      return;
    }

    const svgData = new XMLSerializer().serializeToString(svg);

    const canvas = document.createElement("canvas");

    canvas.width = 500;
    canvas.height = 500;

    const ctx = canvas.getContext("2d");

    const img = new Image();

    img.onload = () => {

      // White background
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, 500, 500);

      // Draw QR
      ctx.drawImage(
        img,
        50,
        50,
        400,
        400
      );

      const png = canvas.toDataURL("image/png");

      const link = document.createElement("a");

      link.download = `${vehicleNumber}-ParkSafe-QR.png`;

      link.href = png;

      link.click();
    };

    img.src =
      "data:image/svg+xml;base64," +
      btoa(
        unescape(
          encodeURIComponent(svgData)
        )
      );
  };


  // ================= PRINT QR =================

  const printQR = () => {
    window.print();
  };


  return (
    <div className="myqr-page">

      <div className="myqr-container">

        {/* ================= HEADER ================= */}

        <div className="myqr-header">

          <button
            className="myqr-back-btn"
            onClick={() => navigate("/dashboard")}
          >
            ←
          </button>

          <h1>My QR</h1>

          <div className="myqr-header-space"></div>

        </div>


        {/* ================= QR CARD ================= */}

        <div className="myqr-card">

          <div className="myqr-icon-circle">
            <FaQrcode />
          </div>

          <h2>
            ParkSafe QR Code
          </h2>

          <p className="myqr-subtitle">
            Your vehicle QR code
          </p>


          {/* ================= QR CODE ================= */}

          <div className="myqr-code-box">

            <QRCode
              id="myParkSafeQR"
              value={qrData}
              size={230}
              bgColor="#ffffff"
              fgColor="#000000"
            />

          </div>


          {/* ================= ACTIVE STATUS ================= */}

          <div className="qr-active">

            <span className="active-dot"></span>

            QR Code Active

          </div>

        </div>


        {/* ================= QR SETTINGS ================= */}

        <div className="myqr-section">

          <h3>
            QR Settings
          </h3>


          {/* DOWNLOAD */}

          <button
            className="myqr-setting-btn"
            onClick={downloadQR}
          >

            <div className="setting-left">

              <div className="setting-icon">
                <FaDownload />
              </div>

              <span>
                Download QR
              </span>

            </div>

            <span className="setting-arrow">
              →
            </span>

          </button>


          {/* PRINT */}

          <button
            className="myqr-setting-btn"
            onClick={printQR}
          >

            <div className="setting-left">

              <div className="setting-icon">
                <FaPrint />
              </div>

              <span>
                Print QR
              </span>

            </div>

            <span className="setting-arrow">
              →
            </span>

          </button>

        </div>

      </div>

    </div>
  );
}

export default MyQR;