import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../../config";
import { formatScanTime } from "../../utils/dateUtils";
import "../../css/Dashboard/ScanActivity.css";

const ScanActivity = () => {
  const navigate = useNavigate();

  const storedUser = JSON.parse(
    localStorage.getItem("parksafe_user") || "{}"
  );

  const userId =
    storedUser?.user_id ||
    storedUser?.id ||
    1;

  const vehicleNumber =
    storedUser?.vehicle_number ||
    storedUser?.vehicleNumber ||
    "";

  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchScanHistory = async () => {
      if (!userId) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `${API_BASE_URL}/scan-history/${userId}/`
        );

        if (response.ok) {
          const data = await response.json();
          setActivities(Array.isArray(data) ? data : []);
        } else {
          console.error("Failed to load scan history");
          setActivities([]);
        }
      } catch (error) {
        console.error("Error fetching scan history:", error);
        setActivities([]);
      } finally {
        setLoading(false);
      }
    };

    fetchScanHistory();
  }, [userId]);

  return (
    <div className="scan-activity-page">
      <div className="scan-activity-container">

        {/* HEADER */}
        <div className="scan-activity-header">
          <button
            className="scan-activity-back"
            onClick={() => navigate("/dashboard")}
          >
            ←
          </button>

          <h1>Scan Activity</h1>

          <div className="header-space"></div>
        </div>

        {/* TITLE */}
        <div className="activity-title">
          <h2>Recent Scans</h2>
          <p>Your recent QR scan activity</p>
        </div>

        {/* ACTIVITY LIST */}
        {loading ? (
          <div style={{ textAlign: "center", padding: "40px 20px", color: "#777" }}>
            <p style={{ margin: 0, color: "#1677ff", fontSize: "14px" }}>Loading scan activity...</p>
          </div>
        ) : activities.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 20px", color: "#777" }}>
            <div style={{ fontSize: "40px", marginBottom: "12px" }}>📍</div>
            <h3 style={{ margin: "0 0 6px", color: "#333", fontSize: "18px" }}>No Scan Activity</h3>
            <p style={{ margin: 0, color: "#888", fontSize: "14px" }}>
              No scans have been recorded for your vehicle QR code yet.
            </p>
          </div>
        ) : (
          <div className="activity-list">
            {activities.map((activity) => (
              <div className="activity-card" key={activity.id}>

                <div className="activity-icon">
                  📍
                </div>

                <div className="activity-info">
                  <h3>{activity.activity_type || "QR Scanned"}</h3>

                  {vehicleNumber && (
                    <p>
                      <strong>Vehicle:</strong>{" "}
                      {vehicleNumber}
                    </p>
                  )}

                  <p>
                    <strong>Location:</strong>{" "}
                    {activity.location || "Scan Location"}
                  </p>

                  <span className="activity-time">
                    {formatScanTime(activity.scanned_at)}
                  </span>
                </div>

                <div className="activity-status">
                  ✓
                  <span>Successful</span>
                </div>

              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
};

export default ScanActivity;