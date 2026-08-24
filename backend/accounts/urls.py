from django.urls import path
from . import views
from .views import (

    RegisterUserView,

    send_test_email,
    send_otp,
    verify_otp,
    reset_password,
    resend_otp,

    login_user,
    logout_user,

    public_vehicle,

    dashboard_stats,

    scan_history,
    log_scan,
    clear_scan_history,

    user_profile,

    user_emergency_contacts,
    emergency_contact_detail,

    download_my_data,
    download_my_data_pdf,
    delete_account,

    get_notifications,
    create_notification,
    mark_notification_read,
    mark_all_notifications_read,

    about_us,
)


urlpatterns = [

    # ========================================================
    # AUTH
    # ========================================================

    path(
        "register/",
        RegisterUserView.as_view(),
        name="register"
    ),

    path(
        "login/",
        login_user,
        name="login"
    ),

    path(
        "logout/",
        logout_user,
        name="logout"
    ),


    # ========================================================
    # PASSWORD / OTP
    # ========================================================

    path(
        "test-email/",
        send_test_email,
        name="test-email"
    ),

    path(
        "send-otp/",
        send_otp,
        name="send_otp"
    ),

    path(
        "verify-otp/",
        verify_otp,
        name="verify_otp"
    ),

    path(
        "reset-password/",
        reset_password,
        name="reset_password"
    ),

    path(
        "resend-otp/",
        resend_otp,
        name="resend_otp"
    ),


    # ========================================================
    # VEHICLE / DASHBOARD
    # ========================================================

    path(
        "vehicle/<int:user_id>/",
        public_vehicle,
        name="public_vehicle"
    ),

    path(
        "dashboard-stats/<int:user_id>/",
        dashboard_stats,
        name="dashboard_stats"
    ),


    # ========================================================
    # SCAN
    # ========================================================

    path(
        "scan-history/<int:user_id>/",
        scan_history,
        name="scan_history"
    ),

    path(
        "log-scan/",
        log_scan,
        name="log_scan"
    ),

    path(
        "clear-scan-history/<int:user_id>/",
        clear_scan_history,
        name="clear_scan_history"
    ),


    # ========================================================
    # PROFILE
    # ========================================================

    path(
        "profile/<int:user_id>/",
        user_profile,
        name="user_profile"
    ),


    # ========================================================
    # EMERGENCY CONTACTS
    # ========================================================

    path(
        "contacts/<int:user_id>/",
        user_emergency_contacts,
        name="user_emergency_contacts"
    ),

    path(
        "contact/<int:contact_id>/",
        emergency_contact_detail,
        name="emergency_contact_detail"
    ),


    # ========================================================
    # SETTINGS
    # ========================================================

   path(
    "download-my-data/<int:user_id>/",
    download_my_data,
    name="download-my-data"
),

path(
    "download-my-data-pdf/<int:user_id>/",
    download_my_data_pdf,
    name="download-my-data-pdf"
),
    path(
        "delete-account/<int:user_id>/",
        delete_account,
        name="delete_account"
    ),


    # ========================================================
    # 🔔 NOTIFICATIONS
    # ========================================================

    path(
        "notifications/<int:user_id>/",
        get_notifications,
        name="get_notifications"
    ),

    path(
        "notifications/<int:user_id>/create/",
        create_notification,
        name="create_notification"
    ),

    path(
        "notification/<int:notification_id>/read/",
        mark_notification_read,
        name="mark_notification_read"
    ),

    path(
        "notifications/<int:user_id>/mark-all-read/",
        mark_all_notifications_read,
        name="mark_all_notifications_read"
    ),


    # ========================================================
    # ℹ️ ABOUT US
    # ========================================================

    path(
        "about-us/",
        about_us,
        name="about_us"
    ),

]