import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../css/Dashboard/Vehicle.css";

const Vehicle = () => {
  const navigate = useNavigate();

  const storedUser = JSON.parse(
    localStorage.getItem("parksafe_user") || "{}"
  );

  const userId =
    storedUser.user_id ||
    storedUser.id ||
    1;

  const [vehicle, setVehicle] = useState({
    vehicleNumber: "",
    registeredOn: "",
    loading: true,
  });

  const [showChangeForm, setShowChangeForm] = useState(false);
  const [newVehicleNumber, setNewVehicleNumber] = useState("");

  useEffect(() => {
    const fetchVehicle = async () => {
      try {
        const response = await fetch(
          `http://127.0.0.1:8000/api/dashboard-stats/${userId}/`
        );

        if (response.ok) {
          const data = await response.json();

          console.log("Vehicle Data:", data);

          setVehicle({
            vehicleNumber:
              data.vehicle_number ||
              storedUser.vehicle_number ||
              "MH12AB1234",

            registeredOn:
              data.registered_on ||
              "16 Aug 2026",

            loading: false,
          });
        } else {
          setVehicle({
            vehicleNumber:
              storedUser.vehicle_number || "MH12AB1234",
            registeredOn: "16 Aug 2026",
            loading: false,
          });
        }
      } catch (error) {
        console.log("Error loading vehicle:", error);

        setVehicle({
          vehicleNumber:
            storedUser.vehicle_number || "MH12AB1234",
          registeredOn: "16 Aug 2026",
          loading: false,
        });
      }
    };

    fetchVehicle();
  }, [userId]);

  const handleChangeVehicle = () => {
    setNewVehicleNumber(vehicle.vehicleNumber);
    setShowChangeForm(true);
  };

  const handleSaveVehicle = () => {
    if (!newVehicleNumber.trim()) {
      alert("Please enter vehicle number");
      return;
    }

    const updatedVehicleNumber =
      newVehicleNumber.trim().toUpperCase();

    setVehicle((prev) => ({
      ...prev,
      vehicleNumber: updatedVehicleNumber,
    }));

    const updatedUser = {
      ...storedUser,
      vehicle_number: updatedVehicleNumber,
    };

    localStorage.setItem(
      "parksafe_user",
      JSON.stringify(updatedUser)
    );

    setShowChangeForm(false);

    alert("Vehicle number updated successfully!");
  };

  return (
    <div className="vehicle-page">
      <div className="vehicle-container">

        {/* ================= HEADER ================= */}

        <div className="vehicle-header">

          <button
            className="vehicle-back-btn"
            onClick={() => navigate("/dashboard")}
          >
            ←
          </button>

          {/* ONLY THIS HEADING IS BLUE */}
          <h1 style={{ color: "#1677ff" }}>
            My Vehicle
          </h1>

          <div className="vehicle-header-space"></div>

        </div>

        {/* ================= VEHICLE CARD ================= */}

        <div className="vehicle-main-card">

          <div className="vehicle-icon-circle">
            🚗
          </div>

          <h2>
            {vehicle.loading
              ? "Loading..."
              : vehicle.vehicleNumber}
          </h2>

          <p>
            Registered Vehicle
          </p>

        </div>

        {/* ================= VEHICLE INFORMATION ================= */}

        <div className="vehicle-section">

          <h3>
            Vehicle Information
          </h3>

          <div className="vehicle-info-card">

            <div className="vehicle-info-item">

              <span>
                Vehicle Number
              </span>

              <strong>
                {vehicle.loading
                  ? "Loading..."
                  : vehicle.vehicleNumber}
              </strong>

            </div>

            <div className="vehicle-divider"></div>

            <div className="vehicle-info-item">

              <span>
                Registered on
              </span>

              <strong>
                {vehicle.loading
                  ? "Loading..."
                  : vehicle.registeredOn}
              </strong>

            </div>

          </div>

        </div>

        {/* ================= VEHICLE SETTINGS ================= */}

        <div className="vehicle-section">

          <h3>
            Vehicle Settings
          </h3>

          {!showChangeForm ? (

            <button
              className="vehicle-setting-btn"
              onClick={handleChangeVehicle}
            >

              <div className="vehicle-setting-left">

                <div className="vehicle-setting-icon">
                  🚗
                </div>

                <div>
                  <span>
                    Change Vehicle Number
                  </span>

                  <small>
                    Update your registered vehicle
                  </small>
                </div>

              </div>

              <span className="vehicle-arrow">
                →
              </span>

            </button>

          ) : (

            <div className="vehicle-change-form">

              <label>
                New Vehicle Number
              </label>

              <input
                type="text"
                value={newVehicleNumber}
                onChange={(e) =>
                  setNewVehicleNumber(e.target.value)
                }
                placeholder="Enter vehicle number"
              />

              <div className="vehicle-form-buttons">

                <button
                  type="button"
                  onClick={() => setShowChangeForm(false)}
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleSaveVehicle}
                >
                  Save
                </button>

              </div>

            </div>

          )}

        </div>

      </div>
    </div>
  );
};

export default Vehicle;