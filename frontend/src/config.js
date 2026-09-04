// ============================================================
// PARKSAFE QR - CENTRAL API & APPLICATION CONFIGURATION
// ============================================================

const DEFAULT_LAN_IP = "10.52.74.35";

const getHost = () => {
  if (typeof window !== "undefined" && window.location.hostname) {
    const h = window.location.hostname;

    // Local development → Django runs on localhost
    if (h === "localhost" || h === "127.0.0.1") {
      return "127.0.0.1";
    }

    // LAN / deployed access → use the current host
    return h;
  }

  return DEFAULT_LAN_IP;
};

export const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL ||
  `http://${getHost()}:8000/api`;

export const FRONTEND_BASE_URL =
  process.env.REACT_APP_FRONTEND_URL ||
  (typeof window !== "undefined" &&
  window.location.hostname !== "localhost" &&
  window.location.hostname !== "127.0.0.1"
    ? window.location.origin
    : `http://${DEFAULT_LAN_IP}:3000`);

/**
 * Generates the public vehicle link for QR code scanning.
 * @param {string|number} userId
 * @returns {string} e.g. http://10.52.74.35:3000/vehicle/1
 */
export const getPublicVehicleUrl = (userId) => {
  const base =
    process.env.REACT_APP_FRONTEND_URL ||
    (typeof window !== "undefined" &&
    window.location.hostname !== "localhost" &&
    window.location.hostname !== "127.0.0.1"
      ? window.location.origin
      : `http://${DEFAULT_LAN_IP}:3000`);

  return `${base}/vehicle/${userId}`;
};