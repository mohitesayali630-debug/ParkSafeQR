import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import logo from "../assets/images/logo.png";
import "../css/PublicVehicle.css";

function PublicVehicle() {
    const { userId } = useParams();
    const [showEmergency, setShowEmergency] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [vehicle, setVehicle] = useState({
        owner: "",
        phone: "",
        bloodGroup: "",
        vehicleNumber: "",
        privacy: "private",
        emergencyContacts: [],
    });

    useEffect(() => {
        if (!userId) {
            setError("No vehicle ID specified.");
            setLoading(false);
            return;
        }

        const fetchVehicle = async () => {
            try {
                const response = await fetch(`http://10.52.74.35:8000/api/vehicle/${userId}/`)
                if (!response.ok) {
                    throw new Error("Vehicle not found.");
                }
                const data = await response.json();

                setVehicle({
                    owner: data.full_name || "Vehicle Owner",
                    phone: data.mobile_number ? data.mobile_number.replace("+91", "") : "",
                    bloodGroup: data.blood_group || "N/A",
                    vehicleNumber: data.vehicle_number || "N/A",
                    privacy: data.privacy || "private",
                    emergencyContacts: (data.contacts || []).map((c) => ({
                        name: c.name,
                        phone: c.number,
                        relation: "Emergency Contact",
                    })),
                });

                // Background log scan
                fetch("http://10.202.232.35:8000/api/log-scan/", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        user_id: userId,
                        location: "QR Code Scan",
                        activity_type: "QR Scanned",
                    }),
                }).catch(() => {});
            } catch (err) {
                setError(err.message || "Failed to load vehicle details.");
            } finally {
                setLoading(false);
            }
        };

        fetchVehicle();
    }, [userId]);

    const whatsappMessage =
        "Hello, I scanned your ParkSafe QR. I need to contact you regarding your vehicle.";

    if (loading) {
        return (
            <div className="page">
                <div className="parksafe-card loading-card">
                    <div className="brand">
                        <img src={logo} alt="ParkSafe QR Logo" className="parkgate-logo" />
                    </div>
                    <h2>Loading Vehicle Details...</h2>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="page">
                <div className="parksafe-card error-card">
                    <div className="brand">
                        <img src={logo} alt="ParkSafe QR Logo" className="parkgate-logo" />
                    </div>
                    <div className="error-icon">!</div>
                    <h2>{error}</h2>
                    <p>Please check the QR code and try again.</p>
                </div>
            </div>
        );
    }


    return (
        <div className="page">

            <div className="parksafe-card">

                {/* LOGO */}
                <div className="brand">
                    <img
                        src={logo}
                        alt="ParkSafe QR Logo"
                        className="parkgate-logo"
                    />
                </div>

               {/* OWNER NAME */}
                <div className="owner-name">
                    {vehicle.owner}
                </div>

                {/* PHONE */}
                <div className="info-row">
                    <span className="info-label">
                        Phone Number
                    </span>

                    <span className="info-value">
                        ******{vehicle.phone.slice(-4)}
                    </span>
                </div>

                {/* VEHICLE */}
                <div className="info-row">
                    <span className="info-label">
                        Car Number
                    </span>

                    <span className="info-value">
                        {vehicle.vehicleNumber}
                    </span>
                </div>

                {/* BLOOD */}
                <div className="info-row">
                    <span className="info-label">
                        Blood Group
                    </span>

                    <span className="info-value">
                        {vehicle.bloodGroup}
                    </span>
                </div>

                {showEmergency && (
    <div className="emergency-box">

        <div className="emergency-title">
            🚨 Emergency Contacts
        </div>

        <div className="emergency-list">

            {vehicle.emergencyContacts.map((contact, index) => (
                <div className="emergency-contact" key={index}>

                    <div className="emergency-contact-info">

                        <div className="emergency-name">
                            {contact.name}
                        </div>

                        <div className="emergency-relation">
                            {contact.relation}
                        </div>

                        <div className="emergency-number">
                            {contact.phone}
                        </div>

                    </div>

                    <a
                        href={`tel:${contact.phone}`}
                        className="emergency-call-btn"
                    >
                        📞 Call
                    </a>

                </div>
            ))}

        </div>

    </div>
)}
                {/* CALL OWNER */}
                <a
                    href={`tel:${vehicle.phone}`}
                    className="call-owner-btn"
                >
                    📞 &nbsp; Call Owner
                </a>

                {/* WHATSAPP + SOS */}
                <div className="bottom-buttons">

                    <a
                        href={`https://wa.me/91${vehicle.phone}?text=${encodeURIComponent(
                            whatsappMessage
                        )}`}
                        target="_blank"
                        rel="noreferrer"
                        className="whatsapp-btn"
                    >
                        💬 WhatsApp
                    </a>

                    <button
                        className="sos-btn"
                        onClick={() =>
                            setShowEmergency(!showEmergency)
                        }
                    >
                        🚨 SOS / Emergency
                    </button>

                </div>

            </div>

        </div>
    );
}

export default PublicVehicle;