import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../../config";

function Settings() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // ============================================================
  // SAFE JSON PARSER
  // ============================================================

  const safeJSONParse = (value) => {
    if (!value) return null;

    try {
      return JSON.parse(value);
    } catch {
      return null;
    }
  };

  // ============================================================
  // FIND USER ID INSIDE OBJECT
  // ============================================================

  const findUserIdInsideObject = (obj) => {
    if (!obj || typeof obj !== "object") {
      return null;
    }

    const possibleIds = [
      obj.user_id,
      obj.userId,
      obj.userid,
      obj.id,
      obj._id,
      obj.pk,
    ];

    for (const id of possibleIds) {
      if (
        id !== undefined &&
        id !== null &&
        String(id).trim() !== ""
      ) {
        return String(id).trim();
      }
    }

    const nestedKeys = [
      "user",
      "data",
      "result",
      "profile",
      "account",
    ];

    for (const key of nestedKeys) {
      if (obj[key]) {
        const foundId = findUserIdInsideObject(obj[key]);

        if (foundId) {
          return foundId;
        }
      }
    }

    return null;
  };

  // ============================================================
  // GET USER ID FROM JWT
  // ============================================================

  const getUserIdFromToken = (token) => {
    if (!token || typeof token !== "string") {
      return null;
    }

    try {
      const parts = token.split(".");

      if (parts.length !== 3) {
        return null;
      }

      let payload = parts[1];

      payload = payload
        .replace(/-/g, "+")
        .replace(/_/g, "/");

      while (payload.length % 4) {
        payload += "=";
      }

      const decodedPayload = JSON.parse(atob(payload));

      return findUserIdInsideObject(decodedPayload);
    } catch {
      console.log("Unable to decode token.");
      return null;
    }
  };

  // ============================================================
  // GET USER ID
  // ============================================================

  const getUserId = () => {
    const directKeys = [
      "user_id",
      "userId",
      "userid",
      "id",
      "loggedInUserId",
      "currentUserId",
      "current_user_id",
      "accountId",
      "account_id",
      "profileId",
      "profile_id",
    ];

    // LOCAL STORAGE
    for (const key of directKeys) {
      const value = localStorage.getItem(key);

      if (
        value &&
        value !== "null" &&
        value !== "undefined"
      ) {
        const cleanValue = value.trim();

        if (cleanValue) {
          return cleanValue;
        }
      }
    }

    // SESSION STORAGE
    for (const key of directKeys) {
      const value = sessionStorage.getItem(key);

      if (
        value &&
        value !== "null" &&
        value !== "undefined"
      ) {
        const cleanValue = value.trim();

        if (cleanValue) {
          return cleanValue;
        }
      }
    }

    // OBJECT KEYS
    const objectKeys = [
      "user",
      "userData",
      "currentUser",
      "loggedInUser",
      "loginUser",
      "loginData",
      "authUser",
      "auth",
      "profile",
      "account",
      "current_user",
      "user_data",
      "auth_data",
      "login_data",
      "session",
    ];

    // LOCAL STORAGE OBJECTS
    for (const key of objectKeys) {
      const storedValue = localStorage.getItem(key);

      if (!storedValue) {
        continue;
      }

      const parsedValue = safeJSONParse(storedValue);
      const foundId = findUserIdInsideObject(parsedValue);

      if (foundId) {
        return foundId;
      }
    }

    // SESSION STORAGE OBJECTS
    for (const key of objectKeys) {
      const storedValue = sessionStorage.getItem(key);

      if (!storedValue) {
        continue;
      }

      const parsedValue = safeJSONParse(storedValue);
      const foundId = findUserIdInsideObject(parsedValue);

      if (foundId) {
        return foundId;
      }
    }

    // SEARCH ALL LOCAL STORAGE
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);

      if (!key) continue;

      const value = localStorage.getItem(key);

      if (!value) continue;

      const parsedValue = safeJSONParse(value);
      const foundId = findUserIdInsideObject(parsedValue);

      if (foundId) {
        return foundId;
      }
    }

    // SEARCH ALL SESSION STORAGE
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);

      if (!key) continue;

      const value = sessionStorage.getItem(key);

      if (!value) continue;

      const parsedValue = safeJSONParse(value);
      const foundId = findUserIdInsideObject(parsedValue);

      if (foundId) {
        return foundId;
      }
    }

    // JWT
    const tokenKeys = [
      "token",
      "access_token",
      "accessToken",
      "authToken",
      "jwt",
      "access",
      "loginToken",
    ];

    for (const key of tokenKeys) {
      const token =
        localStorage.getItem(key) ||
        sessionStorage.getItem(key);

      if (!token) continue;

      const tokenUserId = getUserIdFromToken(token);

      if (tokenUserId) {
        return tokenUserId;
      }
    }

    return null;
  };

  // ============================================================
  // CLEAR MESSAGES
  // ============================================================

  const clearMessages = () => {
    setMessage("");
    setError("");
  };

  // ============================================================
  // READ RESPONSE
  // ============================================================

  const readResponse = async (response) => {
    const contentType =
      response.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
      try {
        return await response.json();
      } catch {
        return {};
      }
    }

    try {
      const text = await response.text();

      return {
        message: text,
      };
    } catch {
      return {};
    }
  };

  // ============================================================
  // CLEAR SCAN HISTORY
  // ============================================================

  const handleClearScanHistory = async () => {
    clearMessages();

    const userId = getUserId();

    console.log("ParkSafe User ID:", userId);

    if (!userId) {
      setError("User ID not found. Please login again.");
      return;
    }

    const confirmDelete = window.confirm(
      "Are you sure you want to clear your complete scan history?"
    );

    if (!confirmDelete) {
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        `${API_BASE_URL}/clear-scan-history/${encodeURIComponent(
          userId
        )}/`,
        {
          method: "DELETE",
          headers: {
            Accept: "application/json",
          },
        }
      );

      const data = await readResponse(response);

      if (!response.ok) {
        throw new Error(
          data.error ||
            data.message ||
            "Unable to clear scan history."
        );
      }

      setMessage(
        `Scan history cleared successfully. ${
          data.deleted_count || 0
        } records deleted.`
      );
    } catch (err) {
      console.error("Clear scan history error:", err);

      setError(
        err.message ||
          "Something went wrong while clearing history."
      );
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // DOWNLOAD MY DATA
  // ============================================================

 const handleDownloadMyData = async () => {
  clearMessages();

  const userId = getUserId();

  console.log("ParkSafe Download User ID:", userId);

  if (!userId) {
    setError("User ID not found. Please login again.");
    return;
  }

  try {
    setLoading(true);

        const response = await fetch(
      `${API_BASE_URL}/download-my-data-pdf/${encodeURIComponent(
        userId
      )}/`,
      {
        method: "GET",
      }
    );

    if (!response.ok) {
      const data = await readResponse(response);

      throw new Error(
        data.error ||
          data.message ||
          "Unable to download your PDF."
      );
    }

    const blob = await response.blob();

    if (!blob || blob.size === 0) {
      throw new Error(
        "Server returned an empty PDF file."
      );
    }

    let fileName = "parksafe_my_data.pdf";

    const contentDisposition =
      response.headers.get("content-disposition");

    if (contentDisposition) {
      const match =
        contentDisposition.match(
          /filename="?([^"]+)"?/i
        );

      if (match && match[1]) {
        fileName = match[1];
      }
    }

    const downloadUrl =
      window.URL.createObjectURL(blob);

    const link =
      document.createElement("a");

    link.href = downloadUrl;
    link.download = fileName;

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);

    setTimeout(() => {
      window.URL.revokeObjectURL(downloadUrl);
    }, 1000);

    setMessage(
      "Your ParkSafe data PDF has been downloaded successfully."
    );

  } catch (err) {

    console.error(
      "Download my data PDF error:",
      err
    );

    setError(
      err.message ||
        "Something went wrong while downloading your PDF."
    );

  } finally {

    setLoading(false);
  }
};
  // ============================================================
  // DELETE ACCOUNT
  // ============================================================

  const handleDeleteAccount = async () => {
    clearMessages();

    const userId = getUserId();

    console.log("ParkSafe Delete User ID:", userId);

    if (!userId) {
      setError("User ID not found. Please login again.");
      return;
    }

    const confirmDelete = window.confirm(
      "Are you sure you want to permanently delete your ParkSafe account?\n\nYour profile, emergency contacts and scan history will also be deleted."
    );

    if (!confirmDelete) {
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        `${API_BASE_URL}/delete-account/${encodeURIComponent(
          userId
        )}/`,
        {
          method: "DELETE",
          headers: {
            Accept: "application/json",
          },
        }
      );

      const data = await readResponse(response);

      if (!response.ok) {
        throw new Error(
          data.error ||
            data.message ||
            "Unable to delete account."
        );
      }

      localStorage.clear();
      sessionStorage.clear();

      alert(
        "Your ParkSafe account has been deleted successfully."
      );

      window.location.href = "/";
    } catch (err) {
      console.error("Delete account error:", err);

      setError(
        err.message ||
          "Something went wrong while deleting your account."
      );
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // PROFILE
  // ============================================================

  const handleProfile = () => {
    navigate("/profile", {
      state: { from: "/settings" },
    });
  };

  // ============================================================
  // BACK TO DASHBOARD
  // ============================================================

  const handleBack = () => {
    navigate("/dashboard");
  };

  // ============================================================
  // STYLES
  // ============================================================

  const styles = {
    // ========================================================
    // PAGE
    // ========================================================

    page: {
      minHeight: "100vh",
      width: "100%",
      background:
        "linear-gradient(135deg, #e8f3ff 0%, #dceeff 50%, #f4f9ff 100%)",
      padding: "28px 16px 40px",
      boxSizing: "border-box",
      fontFamily:
        "Poppins, Arial, Helvetica, sans-serif",
      display: "flex",
      justifyContent: "center",
      alignItems: "flex-start",
    },

    // ========================================================
    // 410PX APP SHELL
    // ========================================================

    shell: {
      width: "410px",
      maxWidth: "410px",
      background: "#ffffff",
      borderRadius: "26px",
      overflow: "hidden",
      border: "1px solid #dfeaf5",
      boxShadow:
        "0 20px 55px rgba(55, 105, 160, 0.16)",
      boxSizing: "border-box",
    },

    // ========================================================
    // TOP BAR
    // ========================================================

    topBar: {
      height: "76px",
      width: "100%",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "0 18px",
      background: "#ffffff",
      borderBottom: "1px solid #edf3fa",
      boxSizing: "border-box",
    },

    // ========================================================
    // BACK BUTTON
    // ========================================================

    topButton: {
      width: "42px",
      height: "42px",
      border: "none",
      borderRadius: "13px",
      background: "#eef7ff",
      color: "#1677f5",
      fontSize: "24px",
      fontWeight: "600",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: 0,
      transition: "all 0.2s ease",
    },

    // ========================================================
    // TITLE
    // ========================================================

    topTitle: {
      fontSize: "25px",
      lineHeight: "1",
      fontWeight: "800",
      color: "#1677f5",
      textAlign: "center",
    },

    // ========================================================
    // RIGHT SPACER
    // ========================================================

    topSpacer: {
      width: "42px",
      height: "42px",
    },

    // ========================================================
    // CONTENT
    // ========================================================

    content: {
      padding: "24px 15px 28px",
      boxSizing: "border-box",
    },

    // ========================================================
    // MESSAGES
    // ========================================================

    message: {
      width: "100%",
      padding: "11px 12px",
      borderRadius: "12px",
      marginBottom: "14px",
      fontSize: "10.5px",
      lineHeight: "1.45",
      boxSizing: "border-box",
    },

    success: {
      background: "#effaf4",
      border: "1px solid #ccebd9",
      color: "#198754",
    },

    error: {
      background: "#fff2f2",
      border: "1px solid #f3cccc",
      color: "#dc3545",
    },

    // ========================================================
    // MAIN CARD
    // ========================================================

    mainCard: {
      width: "100%",
      border: "1px solid #dbe9f7",
      borderRadius: "20px",
      padding: "17px 13px 14px",
      background: "#ffffff",
      boxShadow:
        "0 8px 24px rgba(65, 120, 170, 0.07)",
      boxSizing: "border-box",
    },

    // ========================================================
    // SECTIONS
    // ========================================================

    section: {
      marginBottom: "25px",
    },

    sectionLast: {
      marginBottom: 0,
    },

    // ========================================================
    // SECTION TITLE
    // ========================================================

    sectionTitle: {
      display: "flex",
      alignItems: "center",
      gap: "9px",
      margin: "0 4px 11px",
      fontSize: "11px",
      letterSpacing: "0.9px",
      fontWeight: "800",
      color: "#526f8d",
    },

    sectionLine: {
      width: "4px",
      height: "16px",
      borderRadius: "10px",
      background: "#1677f5",
      flexShrink: 0,
    },

    // ========================================================
    // OPTION
    // ========================================================

    option: {
      width: "100%",
      minHeight: "76px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: "10px",
      padding: "11px 10px",
      marginBottom: "10px",
      border: "1px solid #dce9f6",
      borderRadius: "15px",
      background: "#ffffff",
      cursor: "pointer",
      textAlign: "left",
      boxSizing: "border-box",
      transition: "all 0.2s ease",
      fontFamily:
        "Poppins, Arial, Helvetica, sans-serif",
    },

    // ========================================================
    // OPTION LEFT
    // ========================================================

    optionLeft: {
      display: "flex",
      alignItems: "center",
      gap: "12px",
      minWidth: 0,
      flex: 1,
    },

    // ========================================================
    // ICON
    // ========================================================

    icon: {
      width: "44px",
      height: "44px",
      minWidth: "44px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      borderRadius: "13px",
      background: "#edf6ff",
      color: "#1677f5",
      fontSize: "19px",
      boxSizing: "border-box",
    },

    // ========================================================
    // TEXT
    // ========================================================

    text: {
      minWidth: 0,
      flex: 1,
    },

    optionTitle: {
      margin: 0,
      fontSize: "14px",
      lineHeight: "1.3",
      fontWeight: "800",
      color: "#173f68",
    },

    optionDescription: {
      margin: "4px 0 0",
      fontSize: "10.5px",
      lineHeight: "1.4",
      color: "#7890a8",
    },

    // ========================================================
    // ARROW
    // ========================================================

    arrow: {
      width: "31px",
      height: "31px",
      minWidth: "31px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      borderRadius: "9px",
      background: "#eef7ff",
      color: "#1677f5",
      fontSize: "17px",
      fontWeight: "700",
      boxSizing: "border-box",
    },

    // ========================================================
    // DELETE
    // ========================================================

    deleteTitle: {
      color: "#c92c2c",
    },

    deleteIcon: {
      background: "#fff0f0",
      color: "#df3434",
    },

    deleteArrow: {
      background: "#fff0f0",
      color: "#df3434",
    },

    // ========================================================
    // LOADING
    // ========================================================

    loading: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "7px",
      padding: "15px 5px 2px",
      color: "#1677f5",
      fontWeight: "700",
      fontSize: "10.5px",
    },
  };

  // ============================================================
  // UI
  // ============================================================

  return (
    <div style={styles.page}>
      <div style={styles.shell}>

        {/* ====================================================
            TOP BAR
        ==================================================== */}

        <div style={styles.topBar}>

          <button
            type="button"
            onClick={handleBack}
            aria-label="Back to dashboard"
            style={styles.topButton}
          >
            ←
          </button>

          <div style={styles.topTitle}>
            Settings
          </div>

          <div style={styles.topSpacer}></div>

        </div>

        {/* ====================================================
            CONTENT
        ==================================================== */}

        <div style={styles.content}>

          {/* SUCCESS MESSAGE */}

          {message && (
            <div
              style={{
                ...styles.message,
                ...styles.success,
              }}
            >
              <strong>Success</strong>

              <div>{message}</div>
            </div>
          )}

          {/* ERROR MESSAGE */}

          {error && (
            <div
              style={{
                ...styles.message,
                ...styles.error,
              }}
            >
              <strong>
                Something went wrong
              </strong>

              <div>{error}</div>
            </div>
          )}

          {/* ==================================================
              MAIN SETTINGS CARD
          ================================================== */}

          <div style={styles.mainCard}>

            {/* ==================================================
                ACCOUNT
            ================================================== */}

            <div style={styles.section}>

              <div style={styles.sectionTitle}>
                <span style={styles.sectionLine}></span>

                ACCOUNT
              </div>

              {/* PROFILE */}

              <button
                type="button"
                onClick={handleProfile}
                disabled={loading}
                style={{
                  ...styles.option,
                  opacity: loading ? 0.6 : 1,
                }}
              >

                <div style={styles.optionLeft}>

                  <div style={styles.icon}>
                    👤
                  </div>

                  <div style={styles.text}>

                    <h3 style={styles.optionTitle}>
                      Profile
                    </h3>

                    <p style={styles.optionDescription}>
                      View and manage your personal profile
                    </p>

                  </div>

                </div>

                <div style={styles.arrow}>
                  →
                </div>

              </button>

            </div>

            {/* ==================================================
                DATA & PRIVACY
            ================================================== */}

            <div style={styles.section}>

              <div style={styles.sectionTitle}>
                <span style={styles.sectionLine}></span>

                DATA & PRIVACY
              </div>

              {/* CLEAR SCAN HISTORY */}

              <button
                type="button"
                onClick={
                  loading
                    ? undefined
                    : handleClearScanHistory
                }
                disabled={loading}
                style={{
                  ...styles.option,
                  opacity: loading ? 0.6 : 1,
                }}
              >

                <div style={styles.optionLeft}>

                  <div style={styles.icon}>
                    🧹
                  </div>

                  <div style={styles.text}>

                    <h3 style={styles.optionTitle}>
                      Clear Scan History
                    </h3>

                    <p style={styles.optionDescription}>
                      Remove your previous scan records
                    </p>

                  </div>

                </div>

                <div style={styles.arrow}>
                  →
                </div>

              </button>

              {/* DOWNLOAD MY DATA */}

              <button
                type="button"
                onClick={
                  loading
                    ? undefined
                    : handleDownloadMyData
                }
                disabled={loading}
                style={{
                  ...styles.option,
                  opacity: loading ? 0.6 : 1,
                  marginBottom: 0,
                }}
              >

                <div style={styles.optionLeft}>

                  <div style={styles.icon}>
                    ↓
                  </div>

                  <div style={styles.text}>

                    <h3 style={styles.optionTitle}>
                      Download My Data
                    </h3>

                  <p style={styles.optionDescription}>
                    {loading
                      ? "Preparing your PDF..."
                      : "Download a PDF copy of your data"}
                  </p>

                  </div>

                </div>

                <div style={styles.arrow}>
                  →
                </div>

              </button>

            </div>

            {/* ==================================================
                ACCOUNT CONTROL
            ================================================== */}

            <div style={styles.sectionLast}>

              <div style={styles.sectionTitle}>

                <span
                  style={{
                    ...styles.sectionLine,
                    background: "#e33434",
                  }}
                ></span>

                ACCOUNT CONTROL

              </div>

              {/* DELETE ACCOUNT */}

              <button
                type="button"
                onClick={
                  loading
                    ? undefined
                    : handleDeleteAccount
                }
                disabled={loading}
                style={{
                  ...styles.option,
                  opacity: loading ? 0.6 : 1,
                  marginBottom: 0,
                }}
              >

                <div style={styles.optionLeft}>

                  <div
                    style={{
                      ...styles.icon,
                      ...styles.deleteIcon,
                    }}
                  >
                    🗑
                  </div>

                  <div style={styles.text}>

                    <h3
                      style={{
                        ...styles.optionTitle,
                        ...styles.deleteTitle,
                      }}
                    >
                      Delete Account
                    </h3>

                    <p style={styles.optionDescription}>
                      Permanently delete your account
                    </p>

                  </div>

                </div>

                <div
                  style={{
                    ...styles.arrow,
                    ...styles.deleteArrow,
                  }}
                >
                  →
                </div>

              </button>

            </div>

          </div>

          {/* ==================================================
              LOADING
          ================================================== */}

          {loading && (
            <div style={styles.loading}>
              <span>⏳</span>

              <span>
                Please wait...
              </span>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

export default Settings;