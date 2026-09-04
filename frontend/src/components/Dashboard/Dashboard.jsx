import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../../config";
import { formatScanTime } from "../../utils/dateUtils";
import "../../css/Dashboard/Dashboard.css";
import logo from "../../assets/images/logo.png";

import {
  FaBars,
  FaBell,
  FaChevronRight,
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaHome,
  FaCar,
  FaQrcode,
  FaCamera,
  FaCog,
  FaInfoCircle,
  FaSignOutAlt,
  FaTimes,
} from "react-icons/fa";

function Dashboard() {
  const navigate = useNavigate();

  const storedUser = JSON.parse(
    localStorage.getItem("parksafe_user") || "{}"
  );

  const userId =
    storedUser.user_id ||
    storedUser.id ||
    1;

  const [menuOpen, setMenuOpen] = useState(false);

  const [stats, setStats] = useState({
    fullName: storedUser.full_name || "User",
    vehicleStatus: "Active",
    qrStatus: "Generated",
    contactsCount: 0,
    recentScans: [],
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch(
          `${API_BASE_URL}/dashboard-stats/${userId}/`
        );

        if (response.ok) {
          const data = await response.json();

          setStats({
            fullName:
              data.full_name ||
              storedUser.full_name ||
              "User",

            vehicleStatus:
              data.vehicle_status ||
              "Active",

            qrStatus:
              data.qr_status ||
              "Generated",

            contactsCount:
              data.contacts_count !== undefined
                ? data.contacts_count
                : 0,

            recentScans:
              data.recent_scans ||
              [],
          });
        }
      } catch (err) {
        console.log(
          "Error loading dashboard stats:",
          err
        );
      }
    };

    fetchStats();
  }, [userId]);

  const firstName =
    stats.fullName.split(" ")[0];

  /* ===============================
     HAMBURGER MENU ACTIONS
  =============================== */

  const openMenu = () => {
    setMenuOpen(true);
  };

  const closeMenu = () => {
    setMenuOpen(false);
  };

  const handleSettings = () => {
    setMenuOpen(false);
    navigate("/settings");
  };

  const handleNotifications = () => {
    setMenuOpen(false);
    navigate("/notifications");
  };

  const handleAboutUs = () => {
    setMenuOpen(false);
    navigate("/about-us");
  };

  const handleLogout = () => {
    setMenuOpen(false);

    const confirmLogout = window.confirm(
      "Are you sure you want to logout?"
    );

    if (confirmLogout) {
      localStorage.removeItem("parksafe_user");
      navigate("/");
    }
  };

  return (
    <div className="dashboard-page">

      <div className="dashboard-card">

        {/* ================= HEADER ================= */}

        <div className="dashboard-header">

          <button
            className="header-btn"
            onClick={openMenu}
            aria-label="Open menu"
          >
            <FaBars />
          </button>

          <img
            src={logo}
            alt="ParkSafe"
            className="dashboard-logo"
          />

          <button
            className="header-btn"
            onClick={() =>
              navigate("/notifications")
            }
            aria-label="Notifications"
          >
            <FaBell />
          </button>

        </div>


        {/* ================= HAMBURGER MENU ================= */}

        {menuOpen && (
          <>
            {/* Overlay */}

            <div
              className="menu-overlay"
              onClick={closeMenu}
            ></div>


            {/* Menu Panel */}

            <div className="hamburger-menu">

              {/* Menu Header */}

              <div className="hamburger-header">

                <h3>Menu</h3>

                <button
                  className="menu-close-btn"
                  onClick={closeMenu}
                  aria-label="Close menu"
                >
                  <FaTimes />
                </button>

              </div>


              {/* Settings */}

              <button
                className="menu-option"
                onClick={handleSettings}
              >

                <div className="menu-option-left">

                  <div className="menu-icon">
                    <FaCog />
                  </div>

                  <span>
                    Settings
                  </span>

                </div>

                <FaChevronRight className="menu-arrow" />

              </button>


              {/* Notifications */}

              <button
                className="menu-option"
                onClick={handleNotifications}
              >

                <div className="menu-option-left">

                  <div className="menu-icon">
                    <FaBell />
                  </div>

                  <span>
                    Notifications
                  </span>

                </div>

                <FaChevronRight className="menu-arrow" />

              </button>


              {/* About Us */}

              <button
                className="menu-option"
                onClick={handleAboutUs}
              >

                <div className="menu-option-left">

                  <div className="menu-icon">
                    <FaInfoCircle />
                  </div>

                  <span>
                    About Us
                  </span>

                </div>

                <FaChevronRight className="menu-arrow" />

              </button>


              {/* Logout */}

              <button
                className="menu-option logout-option"
                onClick={handleLogout}
              >

                <div className="menu-option-left">

                  <div className="menu-icon">
                    <FaSignOutAlt />
                  </div>

                  <span>
                    Logout
                  </span>

                </div>

                <FaChevronRight className="menu-arrow" />

              </button>

            </div>
          </>
        )}


        {/* ================= MAIN CONTENT ================= */}

        <div className="dashboard-content">

          {/* Welcome */}

          <div className="dashboard-welcome">

            <h2>
              Hello,{" "}
              <span>
                {firstName}
              </span>
            </h2>

            <p>
              Your Safety, Our Priority.
            </p>

          </div>


          {/* Recent Scan */}

          <div className="section-header">

            <h3>
              Recent Scan Activity
            </h3>

                    <button
                      onClick={() => navigate("/scan-activity")}
                      className="view-btn"
                    >
                      View All
                    </button>

          </div>


          {stats.recentScans.length === 0 ? (

            <div className="scan-card">

              <div className="scan-left">

                <div className="scan-icon">
                  <FaMapMarkerAlt />
                </div>

                <div>

                  <h4>
                    QR Code Ready
                  </h4>

                  <p>
                    No recent scans yet
                  </p>

                </div>

              </div>

              <div className="scan-right">

                <span>
                  Active
                </span>

              </div>

            </div>

          ) : (

            stats.recentScans.map(
              (scan, idx) => (

                <div
                  className="scan-card"
                  key={idx}
                >

                  <div className="scan-left">

                    <div className="scan-icon">

                      {scan.activity_type
                        .toLowerCase()
                        .includes(
                          "contact"
                        ) ? (
                        <FaPhoneAlt />
                      ) : (
                        <FaMapMarkerAlt />
                      )}

                    </div>

                    <div>

                  <h4>
                    {scan.activity_type}
                  </h4>

                  <p>
                    {scan.location}
                  </p>

                </div>

              </div>

              <div className="scan-right">

                <span>
                  {formatScanTime(scan.scanned_at)}
                </span>

              </div>

            </div>

              )
            )

          )}


          {/* ================= PARKSAFE STATUS ================= */}

          <div className="status-card">

            <div className="section-header">

              <h3>
                ParkSafe Status
              </h3>

            </div>


            <div className="status-item">

              <span>
                Vehicle Status
              </span>

              <span className="status-active">
                {stats.vehicleStatus}
              </span>

            </div>


            <div className="status-item">

              <span>
                QR Status
              </span>

              <span className="status-active">
                {stats.qrStatus}
              </span>

            </div>


            <div className="status-item">

              <span>
                Emergency Contacts
              </span>

              <span>
                {stats.contactsCount} Added
              </span>

            </div>

          </div>

        </div>


        {/* ================= BOTTOM NAVIGATION ================= */}

        <div className="bottom-navigation">

          <div className="nav-item active">

            <FaHome className="nav-icon" />

            <p>
              Home
            </p>

          </div>


          <div
            className="nav-item"
            onClick={() =>
              navigate("/vehicle-details")
            }
          >

            <FaCar className="nav-icon" />

            <p>
              Vehicle
            </p>

          </div>


          <div className="scan-nav">

            <button
              className="scan-btn"
              onClick={() =>
                navigate("/scan-qr")
              }
            >
              <FaCamera />
            </button>

          </div>


          <div
            className="nav-item"
            onClick={() =>
              navigate("/my-qr")
            }
          >

            <FaQrcode className="nav-icon" />

            <p>
              My QR
            </p>

          </div>


          <div
            className="nav-item"
            onClick={() =>
              navigate("/profile", {
                state: { from: "/dashboard" },
              })
            }
          >

            <span className="nav-icon">
              👤
            </span>

            <p>
              Profile
            </p>

          </div>

        </div>

      </div>

    </div>
  );
}

export default Dashboard;