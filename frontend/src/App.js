import { BrowserRouter, Routes, Route } from "react-router-dom";

import LoginForm from "./components/LoginForm";
import Register from "./components/Register";

import ForgotPassword from "./components/ForgotPassword/ForgotPassword";
import VerifyOTP from "./components/ForgotPassword/VerifyOTP";
import ResetPassword from "./components/ForgotPassword/ResetPassword";
import PasswordResetSuccess from "./components/ForgotPassword/PasswordResetSuccess";

import OTPVerification from "./components/Register/OTPVerification";
import GenerateQR from "./components/Register/GenerateQR";

import Dashboard from "./components/Dashboard/Dashboard";
import Profile from "./components/Dashboard/Profile";
import EmergencyContacts from "./components/Dashboard/EmergencyContacts";
import Vehicle from "./components/Dashboard/Vehicle";
import MyQR from "./components/Dashboard/MyQR";
import ScanQR from "./components/Dashboard/ScanQR";
import History from "./components/Dashboard/History";
import Settings from "./components/Dashboard/Settings";
import AboutUs from "./components/Dashboard/AboutUs";
import Notifications from "./components/Dashboard/Notifications";
import PublicVehicle from "./components/PublicVehicle";

// ============================================================
// APP
// ============================================================

function App() {
  return (
    <BrowserRouter>

      <Routes>

        {/* LOGIN */}

        <Route
          path="/"
          element={<LoginForm />}
        />

        {/* REGISTER */}

        <Route
          path="/register"
          element={<Register />}
        />

        {/* FORGOT PASSWORD */}

        <Route
          path="/forgot-password"
          element={<ForgotPassword />}
        />

        <Route
          path="/verify-otp"
          element={<VerifyOTP />}
        />

        <Route
          path="/reset-password"
          element={<ResetPassword />}
        />

        <Route
          path="/password-reset-success"
          element={<PasswordResetSuccess />}
        />

        {/* REGISTRATION OTP */}

        <Route
          path="/otp"
          element={<OTPVerification />}
        />

        {/* GENERATE QR */}

        <Route
          path="/generate-qr"
          element={<GenerateQR />}
        />

        {/* DASHBOARD */}

        <Route
          path="/dashboard"
          element={<Dashboard />}
        />

        {/* PROFILE */}

        <Route
          path="/profile"
          element={<Profile />}
        />

        {/* EMERGENCY CONTACTS */}

        <Route
          path="/emergency-contacts"
          element={<EmergencyContacts />}
        />

        {/* PUBLIC VEHICLE */}

        <Route
          path="/vehicle/:userId"
          element={<PublicVehicle />}
        />

        {/* MY VEHICLE */}

        <Route
          path="/vehicle-details"
          element={<Vehicle />}
        />

        {/* MY QR */}

        <Route
          path="/my-qr"
          element={<MyQR />}
        />

        {/* SCAN QR */}

        <Route
          path="/scan-qr"
          element={<ScanQR />}
        />

        {/* HISTORY */}

        <Route
          path="/history"
          element={<History />}
        />

        {/* SETTINGS */}

        <Route
          path="/settings"
          element={<Settings />}
        />

        {/* NOTIFICATIONS */}

        <Route
          path="/notifications"
          element={<Notifications />}
        />

        {/* ABOUT US */}

        <Route
          path="/about-us"
          element={<AboutUs />}
        />

        <Route
          path="/notifications"
          element={<Notifications />}
        />

      </Routes>

    </BrowserRouter>
  );
}

export default App;