import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import QRCode from "react-qr-code";
import { getPublicVehicleUrl } from "../../config";

import "../../css/GenerateQR.css";
import logo from "../../assets/images/logo.png";

import {
  FaDownload,
  FaPrint,
  FaArrowRight,
} from "react-icons/fa";

function GenerateQR() {
  const navigate = useNavigate();
  const location = useLocation();

  const storedUser = JSON.parse(localStorage.getItem("parksafe_user") || "{}");

  const {
    userId = storedUser.user_id || storedUser.id || 1,
    ownerName = storedUser.full_name || "Owner",
    vehicleNumber = storedUser.vehicle_number || "",
    mobile = storedUser.mobile_number || "",
  } = location.state || {};

  const uniqueId = `PSQR-${String(userId).padStart(4, "0")}`;

  const qrData = getPublicVehicleUrl(userId);

  const downloadQR = () => {
    const svg = document.getElementById("parksafeQR");

    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);

    const canvas = document.createElement("canvas");
    canvas.width = 300;
    canvas.height = 300;

    const ctx = canvas.getContext("2d");

    const img = new Image();

    img.onload = () => {
      ctx.drawImage(img, 0, 0);

      const png = canvas.toDataURL("image/png");

      const link = document.createElement("a");

      link.download = `${vehicleNumber}.png`;
      link.href = png;
      link.click();
    };

    img.src =
      "data:image/svg+xml;base64," +
      btoa(unescape(encodeURIComponent(svgData)));
  };

  const printQR = () => {
    window.print();
  };

  return (
    <div className="generate-page">

      <div className="generate-card">

        <img
          src={logo}
          alt="ParkSafe"
          className="qr-logo"
        />

        <h1>Registration Successful</h1>

        <p className="subtitle">
          Your ParkSafe QR Code is Ready
        </p>

        <div className="qr-box">

          <QRCode
            id="parksafeQR"
            value={qrData}
            size={180}
          />

        </div>

        <div className="vehicle-info">

          <p>
            <span>Vehicle :</span> {vehicleNumber}
          </p>

          <p>
            <span>ID :</span> {uniqueId}
          </p>

        </div>

        <div className="button-row">

          <button
            className="download-btn"
            onClick={downloadQR}
          >
            <FaDownload />
            Download QR
          </button>

          <button
            className="print-btn"
            onClick={printQR}
          >
            <FaPrint />
            Print QR
          </button>

        </div>

        <button
          className="dashboard-btn"
          onClick={() => navigate("/dashboard")}
        >
          Go To Dashboard
          <FaArrowRight />
        </button>

      </div>

    </div>
  );
}

export default GenerateQR;