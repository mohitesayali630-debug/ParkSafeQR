import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Html5Qrcode } from "html5-qrcode";
import "../../css/Dashboard/ScanQR.css";

const ScanQR = () => {
  const navigate = useNavigate();

  const scannerRef = useRef(null);
  const mountedRef = useRef(true);
  const startingRef = useRef(false);
  const scanLoggedRef = useRef(false);

  const [error, setError] = useState("");
  const [scannedData, setScannedData] = useState("");
  const [flashOn, setFlashOn] = useState(false);

  // ============================================================
  // LOG QR SCAN + CREATE NOTIFICATION
  // ============================================================

  const logScanActivity = async (userId) => {
    if (!userId) return;

    // Prevent duplicate notification for same scan
    if (scanLoggedRef.current) return;

    scanLoggedRef.current = true;

    try {
      const response = await fetch(
       "http://10.52.74.35:8000/api/log-scan/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            user_id: userId,
            location: "Scanned via ParkSafe QR",
            activity_type: "QR Scanned",
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        console.log("Scan log error:", data);
        scanLoggedRef.current = false;
        return;
      }

      console.log("Scan logged successfully:", data);
    } catch (err) {
      console.log("Scan log request failed:", err);
      scanLoggedRef.current = false;
    }
  };

  // ============================================================
  // HANDLE SCANNED QR
  // ============================================================

  const handleScannedQR = async (result) => {
    if (!result) return;

    const decodedText = result.trim();

    console.log("QR Scanned:", decodedText);

    if (mountedRef.current) {
      setScannedData(decodedText);
    }

    /*
     * ==========================================================
     * CASE 1
     * Full URL
     *
     * Example:
     * http://localhost:3000/vehicle/8
     * ==========================================================
     */

    if (decodedText.startsWith("http")) {
      try {
        const url = new URL(decodedText);

        /*
         * Find /vehicle/:userId
         */

        const vehicleMatch =
          url.pathname.match(
            /\/vehicle\/(\d+)/
          );

        if (vehicleMatch) {
          const ownerUserId = vehicleMatch[1];

          console.log(
            "Vehicle Owner ID:",
            ownerUserId
          );

          /*
           * Create ScanActivity + Notification
           */

          await logScanActivity(ownerUserId);

          /*
           * Open Public Vehicle Page
           */

          if (
            url.origin ===
            window.location.origin
          ) {
            navigate(url.pathname);
          } else {
            navigate(
              `/vehicle/${ownerUserId}`
            );
          }

          return;
        }

        /*
         * External URL
         */

        if (
          url.origin ===
          window.location.origin
        ) {
          navigate(url.pathname);
        } else {
          window.location.href = decodedText;
        }

        return;
      } catch (err) {
        console.log(
          "Invalid QR URL:",
          err
        );
      }
    }

    /*
     * ==========================================================
     * CASE 2
     * QR contains only User ID
     *
     * Example:
     * 8
     * ==========================================================
     */

    if (/^\d+$/.test(decodedText)) {
      const ownerUserId =
        decodedText;

      console.log(
        "Vehicle Owner ID:",
        ownerUserId
      );

      /*
       * Create ScanActivity + Notification
       */

      await logScanActivity(
        ownerUserId
      );

      /*
       * Open Public Vehicle Page
       */

      navigate(
        `/vehicle/${ownerUserId}`
      );

      return;
    }

    /*
     * ==========================================================
     * CASE 3
     * QR contains /vehicle/8
     * ==========================================================
     */

    if (
      decodedText.includes(
        "/vehicle/"
      )
    ) {
      const vehicleMatch =
        decodedText.match(
          /\/vehicle\/(\d+)/
        );

      if (vehicleMatch) {
        const ownerUserId =
          vehicleMatch[1];

        console.log(
          "Vehicle Owner ID:",
          ownerUserId
        );

        /*
         * Create ScanActivity + Notification
         */

        await logScanActivity(
          ownerUserId
        );

        /*
         * Open Public Vehicle Page
         */

        navigate(
          `/vehicle/${ownerUserId}`
        );

        return;
      }
    }

    /*
     * Invalid QR
     */

    if (mountedRef.current) {
      setError(
        "Invalid ParkSafe QR Code."
      );
    }
  };

  // ============================================================
  // CAMERA SCANNER
  // ============================================================

  useEffect(() => {
    mountedRef.current = true;

    const scanner =
      new Html5Qrcode(
        "qr-reader"
      );

    scannerRef.current = scanner;

    const startScanner =
      async () => {
        if (
          startingRef.current
        ) {
          return;
        }

        startingRef.current = true;

        try {
          await scanner.start(
            {
              facingMode:
                "environment",
            },
            {
              fps: 10,

              qrbox: {
                width: 250,
                height: 250,
              },

              aspectRatio: 1.0,
            },

            async (decodedText) => {
              if (
                !mountedRef.current
              ) {
                return;
              }

              /*
               * Stop scanner after successful scan
               */

              try {
                const state =
                  scanner.getState();

                if (
                  state === 2 ||
                  state === 3
                ) {
                  await scanner.stop();
                }
              } catch (err) {
                console.log(
                  "Scanner already stopped."
                );
              }

              /*
               * Process QR
               */

              await handleScannedQR(
                decodedText
              );
            },

            () => {
              // QR not detected yet.
            }
          );

          console.log(
            "Camera started successfully."
          );
        } catch (err) {
          console.error(
            "Camera error:",
            err
          );

          if (
            mountedRef.current
          ) {
            setError(
              "Camera access is not available. Please allow camera permission."
            );
          }
        } finally {
          startingRef.current =
            false;
        }
      };

    startScanner();

    return () => {
      mountedRef.current = false;

      const currentScanner =
        scannerRef.current;

      if (currentScanner) {
        try {
          const state =
            currentScanner.getState();

          if (
            state === 2 ||
            state === 3
          ) {
            currentScanner
              .stop()
              .catch(() => {});
          }
        } catch (err) {
          console.log(
            "Scanner cleanup skipped."
          );
        }
      }
    };
  }, [navigate]);

  // ============================================================
  // FLASH
  // ============================================================

  const handleFlash =
    async () => {
      const scanner =
        scannerRef.current;

      if (!scanner) return;

      try {
        const capabilities =
          scanner.getRunningTrackCapabilities();

        if (
          !capabilities.torch
        ) {
          alert(
            "Flash is not supported on this camera."
          );

          return;
        }

        const newFlashState =
          !flashOn;

        await scanner.applyVideoConstraints(
          {
            advanced: [
              {
                torch:
                  newFlashState,
              },
            ],
          }
        );

        setFlashOn(
          newFlashState
        );
      } catch (err) {
        console.log(
          "Flash error:",
          err
        );

        alert(
          "Flash is not available on this device."
        );
      }
    };

  // ============================================================
  // GALLERY QR SCANNER
  // ============================================================

  const handleGallery =
    async (event) => {
      const file =
        event.target.files?.[0];

      if (!file) return;

      try {
        const galleryScanner =
          new Html5Qrcode(
            "gallery-reader"
          );

        const result =
          await galleryScanner.scanFile(
            file,
            true
          );

        console.log(
          "Gallery QR:",
          result
        );

        /*
         * Use same QR processing
         */

        await handleScannedQR(
          result
        );

        /*
         * Clear gallery scanner
         */

        try {
          await galleryScanner.clear();
        } catch (err) {
          console.log(
            "Gallery scanner cleanup skipped."
          );
        }
      } catch (err) {
        console.log(
          "Gallery scan error:",
          err
        );

        setError(
          "Could not read QR code from this image."
        );
      }

      /*
       * Allow selecting the same image again
       */

      event.target.value = "";
    };

  // ============================================================
  // UI
  // ============================================================

  return (
    <div className="scan-page">

      <div className="scan-container">

        {/* HEADER */}

        <div className="scan-header">

          <button
            className="scan-back-btn"
            onClick={() =>
              navigate(
                "/dashboard"
              )
            }
          >
            ←
          </button>

          <h1>
            Scan QR Code
          </h1>

          <div className="scan-header-space"></div>

        </div>

        {/* CONTENT */}

        <div className="scan-content">

          <div className="scan-title">

            <h2>
              Scan Vehicle QR
            </h2>

            <p>
              Place the QR code inside the frame to scan
            </p>

          </div>

          {/* CAMERA */}

          <div className="scanner-box">

            <div id="qr-reader"></div>

          </div>

          {/* CAMERA ACTIONS */}

          <div className="scan-actions">

            {/* FLASH */}

            <button
              className={`scan-action-btn ${
                flashOn
                  ? "active"
                  : ""
              }`}
              onClick={
                handleFlash
              }
            >

              <div className="scan-action-icon">
                🔦
              </div>

              <span>
                Flash
              </span>

            </button>

            {/* GALLERY */}

            <label className="scan-action-btn">

              <div className="scan-action-icon">
                🖼️
              </div>

              <span>
                Gallery
              </span>

              <input
                type="file"
                accept="image/*"
                onChange={
                  handleGallery
                }
                hidden
              />

            </label>

          </div>

          {/* HIDDEN GALLERY SCANNER */}

          <div
            id="gallery-reader"
            style={{
              display: "none",
            }}
          ></div>

          {/* ERROR */}

          {error && (
            <div className="scan-error">
              {error}
            </div>
          )}

        </div>

      </div>

    </div>
  );
};

export default ScanQR;