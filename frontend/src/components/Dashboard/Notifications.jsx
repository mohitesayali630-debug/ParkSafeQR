import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../css/Dashboard/Notifications.css";

const Notifications = () => {
  const navigate = useNavigate();

  const storedUser = JSON.parse(
    localStorage.getItem("parksafe_user") || "{}"
  );

  const userId =
    storedUser.user_id ||
    storedUser.id;

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    fetch(
      `http://127.0.0.1:8000/api/notifications/${userId}/`
    )
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to load notifications");
        }

        return response.json();
      })
      .then((data) => {
        setNotifications(data.notifications || []);
      })
      .catch((error) => {
        console.error(
          "Notification error:",
          error
        );
      })
      .finally(() => {
        setLoading(false);
      });
  }, [userId]);

  const handleNotificationClick = async (notification) => {
    if (notification.is_read) {
      return;
    }

    try {
      await fetch(
        `http://127.0.0.1:8000/api/notification/${notification.id}/read/`,
        {
          method: "PATCH",
        }
      );

      setNotifications((prev) =>
        prev.map((item) =>
          item.id === notification.id
            ? {
                ...item,
                is_read: true,
              }
            : item
        )
      );
    } catch (error) {
      console.error(
        "Read notification error:",
        error
      );
    }
  };

  return (
    <div className="notifications-page">

      <div className="notifications-container">

        {/* HEADER */}

        <div className="notifications-header">

          <button
            className="notifications-back-btn"
            onClick={() => navigate("/dashboard")}
          >
            ←
          </button>

          <h1>Notifications</h1>

          <div className="notifications-header-space"></div>

        </div>

        {/* CONTENT */}

        <div className="notifications-content">

          {loading ? (

            <div className="notification-empty">
              Loading notifications...
            </div>

          ) : notifications.length === 0 ? (

            <div className="notification-empty">

              <div className="notification-empty-icon">
                🔔
              </div>

              <h2>No Notifications</h2>

              <p>
                You don't have any notifications yet.
              </p>

            </div>

          ) : (

            <div className="notification-list">

              {notifications.map((notification) => (

                <div
                  key={notification.id}
                  className={`notification-item ${
                    notification.is_read
                      ? "read"
                      : "unread"
                  }`}
                  onClick={() =>
                    handleNotificationClick(
                      notification
                    )
                  }
                >

                  <div className="notification-icon">
                    🔔
                  </div>

                  <div className="notification-details">

                    <h3>
                      {notification.title}
                    </h3>

                    <p>
                      {notification.message}
                    </p>

                    <small>
                      {notification.created_at}
                    </small>

                  </div>

                  {!notification.is_read && (
                    <div className="notification-dot"></div>
                  )}

                </div>

              ))}

            </div>

          )}

        </div>

      </div>

    </div>
  );
};

export default Notifications;