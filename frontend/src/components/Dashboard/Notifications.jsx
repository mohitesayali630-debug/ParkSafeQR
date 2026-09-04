import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaTrashAlt } from "react-icons/fa";
import { API_BASE_URL } from "../../config";
import { formatScanTime } from "../../utils/dateUtils";
import "../../css/Dashboard/Notifications.css";

const Notifications = () => {
  const navigate = useNavigate();

  const storedUser = JSON.parse(
    localStorage.getItem("parksafe_user") || "{}"
  );

  const userId =
    storedUser?.user_id ||
    storedUser?.id ||
    1;

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  // ==========================
  // Fetch Notifications
  // ==========================
  useEffect(() => {
    const fetchNotifications = async () => {
      if (!userId) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `${API_BASE_URL}/notifications/${userId}/`
        );

        if (response.ok) {
          const data = await response.json();
          setNotifications(
            Array.isArray(data.notifications) ? data.notifications : []
          );
        } else {
          console.error("Failed to fetch notifications");
          setNotifications([]);
        }
      } catch (error) {
        console.error("Error fetching notifications:", error);
        setNotifications([]);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, [userId]);

  // ==========================
  // Mark One as Read (PATCH)
  // ==========================
  const handleNotificationClick = async (notification) => {
    if (notification.is_read) {
      return;
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/notification/${notification.id}/read/`,
        { method: "PATCH" }
      );

      if (response.ok) {
        setNotifications((prev) =>
          prev.map((item) =>
            item.id === notification.id
              ? { ...item, is_read: true }
              : item
          )
        );
      } else {
        console.error("Failed to mark notification as read");
      }
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  // ==========================
  // Mark All as Read (PATCH)
  // ==========================
  const handleMarkAllRead = async () => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/notifications/${userId}/mark-all-read/`,
        { method: "PATCH" }
      );

      if (response.ok) {
        setNotifications((prev) =>
          prev.map((item) => ({ ...item, is_read: true }))
        );
      } else {
        console.error("Failed to mark all notifications as read");
      }
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
  };

  // ==========================
  // Delete Notification (DELETE)
  // ==========================
  const handleDeleteNotification = async (notificationId) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/notification/${notificationId}/delete/?user_id=${userId}`,
        { method: "DELETE" }
      );

      if (response.ok) {
        setNotifications((prev) =>
          prev.filter((item) => item.id !== notificationId)
        );
      } else {
        console.error("Failed to delete notification");
      }
    } catch (error) {
      console.error("Error deleting notification:", error);
    }
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

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

              <div className="notification-empty-icon">
                🔔
              </div>

              <h2>Loading...</h2>

              <p>
                Fetching your notifications.
              </p>

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

            <>

              {unreadCount > 0 && (
                <div style={{ textAlign: "right", marginBottom: "12px" }}>
                  <button
                    onClick={handleMarkAllRead}
                    style={{
                      background: "none",
                      border: "none",
                      color: "#1677ff",
                      fontSize: "13px",
                      cursor: "pointer",
                      padding: "4px 0",
                      fontWeight: "600",
                    }}
                  >
                    Mark all as read
                  </button>
                </div>
              )}

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
                      handleNotificationClick(notification)
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
                        {formatScanTime(notification.created_at)}
                      </small>

                    </div>

                    <div className="notification-actions">
                      {!notification.is_read && (
                        <div className="notification-dot"></div>
                      )}

                      <button
                        className="notification-delete-btn"
                        title="Delete notification"
                        aria-label="Delete notification"
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteNotification(notification.id);
                        }}
                      >
                        <FaTrashAlt />
                      </button>
                    </div>

                  </div>

                ))}

              </div>

            </>

          )}

        </div>

      </div>

    </div>
  );
};

export default Notifications;