from django.contrib.auth.hashers import check_password
from django.core.mail import send_mail
from django.core.validators import validate_email
from django.core.exceptions import ValidationError
from django.conf import settings
from django.http import JsonResponse, HttpResponse

from rest_framework import generics
from rest_framework.response import Response
from rest_framework.decorators import api_view

from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from django.views.decorators.csrf import csrf_exempt
from .models import (
    User,
    OTP,
    EmergencyContact,
    ScanActivity,
    Notification,
)

from django.contrib.auth.hashers import make_password

from .serializers import UserSerializer

import random
from datetime import timedelta
from django.utils import timezone
import json
import requests


# ============================================================
# REGISTER
# ============================================================

class RegisterUserView(generics.CreateAPIView):

    queryset = User.objects.all()
    serializer_class = UserSerializer


# ============================================================
# TEST EMAIL
# ============================================================

@api_view(["GET"])
def send_test_email(request):

    try:

        send_mail(
            subject="ParkSafe QR Test Email",

            message=(
                "Congratulations! Your ParkSafe Email Service "
                "is working successfully."
            ),

            from_email=settings.EMAIL_HOST_USER,

            recipient_list=[
                "mohitesayali630@gmail.com"
            ],

            fail_silently=False,
        )

        return Response({
            "message": "Email Sent Successfully"
        })

    except Exception as e:

        return Response({
            "error": str(e)
        }, status=500)


# ============================================================
# SEND OTP
# ============================================================

@api_view(["POST"])
def send_otp(request):

    identifier = request.data.get("identifier")

    if not identifier:

        return Response({
            "error": "Email or Mobile Number is required."
        }, status=400)

    identifier = str(identifier).strip()

    if "@" in identifier:

        user = User.objects.filter(
            email__iexact=identifier
        ).first()

    else:

        user = User.objects.filter(
            mobile_number=identifier
        ).first()

    if not user:

        return Response({
            "error": "No account found."
        }, status=404)

    email = user.email

    if not email:

        return Response({
            "error": "No email address is registered with this account."
        }, status=400)

    otp = str(
        random.randint(100000, 999999)
    )

    OTP.objects.filter(
        email=email
    ).delete()

    OTP.objects.create(
        email=email,
        otp=otp
    )

    try:

        send_mail(

            subject="ParkSafe QR - Password Reset OTP",

            message=f"""
Hello {user.full_name},

Your OTP for Password Reset is:

{otp}

This OTP is valid for 5 minutes.

Do not share this OTP with anyone.

Regards,
ParkSafe QR Team
""",

            from_email=settings.EMAIL_HOST_USER,

            recipient_list=[email],

            fail_silently=False,
        )

    except Exception as e:

        return Response({
            "error": str(e)
        }, status=500)

    return Response({

        "message": "OTP sent successfully.",

        "email": email
    })


# ============================================================
# VERIFY OTP
# ============================================================

@api_view(["POST"])
def verify_otp(request):

    email = request.data.get("email")
    otp = request.data.get("otp")

    if not email or not otp:

        return Response({
            "error": "Email and OTP are required."
        }, status=400)

    try:

        otp_record = OTP.objects.get(
            email=email,
            otp=otp
        )

    except OTP.DoesNotExist:

        return Response({
            "error": "Invalid OTP."
        }, status=400)

    if timezone.now() > otp_record.expires_at:

        otp_record.delete()

        return Response({
            "error": "OTP has expired."
        }, status=400)

    otp_record.is_verified = True
    otp_record.save()

    return Response({
        "message": "OTP Verified Successfully"
    })


# ============================================================
# RESET PASSWORD
# ============================================================

@api_view(["POST"])
def reset_password(request):

    email = request.data.get("email")
    password = request.data.get("password")

    if not email or not password:

        return Response({
            "error": "Email and Password are required."
        }, status=400)

    try:

        user = User.objects.get(
            email=email
        )

    except User.DoesNotExist:

        return Response({
            "error": "User not found."
        }, status=404)

    try:

        otp = OTP.objects.get(
            email=email,
            is_verified=True
        )

    except OTP.DoesNotExist:

        return Response({
            "error": "OTP verification required."
        }, status=400)

    user.password = make_password(password)
    user.save()

    otp.delete()

    return Response({
        "message": "Password Reset Successfully"
    })


# ============================================================
# RESEND OTP
# ============================================================

@api_view(["POST"])
def resend_otp(request):

    identifier = request.data.get("identifier")

    if not identifier:

        return Response({
            "error": "Email or Mobile Number is required."
        }, status=400)

    identifier = str(identifier).strip()

    if "@" in identifier:

        user = User.objects.filter(
            email__iexact=identifier
        ).first()

    else:

        user = User.objects.filter(
            mobile_number=identifier
        ).first()

    if not user:

        return Response({
            "error": "User not found."
        }, status=404)

    email = user.email

    if not email:

        return Response({
            "error": "No email address is registered with this account."
        }, status=400)

    otp = str(
        random.randint(100000, 999999)
    )

    OTP.objects.filter(
        email=email
    ).delete()

    OTP.objects.create(
        email=email,
        otp=otp
    )

    try:

        send_mail(

            subject="ParkSafe QR - Resend OTP",

            message=f"""
Hello {user.full_name},

Your new OTP is:

{otp}

This OTP is valid for 5 minutes.

Do not share this OTP with anyone.

Regards,
ParkSafe QR Team
""",

            from_email=settings.EMAIL_HOST_USER,

            recipient_list=[email],

            fail_silently=False,
        )

    except Exception as e:

        return Response({
            "error": str(e)
        }, status=500)

    return Response({
        "message": "OTP Resent Successfully"
    })


# ============================================================
# LOGIN
# ============================================================

@api_view(["POST"])
def login_user(request):

    identifier = request.data.get("identifier")
    password = request.data.get("password")

    if not identifier or not password:

        return Response({
            "error": "Email/Mobile and Password are required."
        }, status=400)

    identifier = str(identifier).strip()

    if "@" in identifier:

        user = User.objects.filter(
            email__iexact=identifier
        ).first()

    else:

        clean_mobile = "".join(
            filter(str.isdigit, identifier)
        )

        if len(clean_mobile) >= 10:

            last_10 = clean_mobile[-10:]

            user = (

                User.objects.filter(
                    mobile_number=f"+91{last_10}"
                ).first()

                or User.objects.filter(
                    mobile_number=last_10
                ).first()

                or User.objects.filter(
                    mobile_number=identifier
                ).first()

                or User.objects.filter(
                    mobile_number__endswith=last_10
                ).first()
            )

        else:

            user = User.objects.filter(
                mobile_number=identifier
            ).first()

    if not user:

        return Response({
            "error": "User not found."
        }, status=404)

    if check_password(
        password,
        user.password
    ):

        return Response({

            "message": "Login Successful",

            "full_name": user.full_name,

            "email": user.email,

            "user_id": user.id,

            "mobile_number": user.mobile_number,

            "vehicle_number": user.vehicle_number,
        })

    return Response({
        "error": "Invalid Password"
    }, status=400)


# ============================================================
# PUBLIC VEHICLE
# ============================================================

@api_view(["GET"])
def public_vehicle(request, user_id):

    try:

        user = User.objects.get(
            id=user_id
        )

    except User.DoesNotExist:

        return Response({
            "error": "Vehicle not found."
        }, status=404)

    contacts = []

    for contact in user.contacts.all():

        contacts.append({

            "id": contact.id,

            "name": contact.name,

            "number": contact.number
        })

    return Response({

        "id": user.id,

        "full_name": user.full_name,

        "vehicle_number": user.vehicle_number,

        "mobile_number": user.mobile_number,

        "blood_group": user.blood_group,

        "medical_condition": user.medical_condition,

        "privacy": user.privacy,

        "contacts": contacts
    })


# ============================================================
# DASHBOARD STATS
# ============================================================

@api_view(["GET"])
def dashboard_stats(request, user_id):

    try:

        user = User.objects.get(
            id=user_id
        )

    except User.DoesNotExist:

        return Response({
            "error": "User not found."
        }, status=404)

    contacts_count = user.contacts.count()

    recent_scans = []

    for scan in user.scan_activities.order_by(
        "-scanned_at"
    )[:2]:

        recent_scans.append({

            "id": scan.id,

            "activity_type": scan.activity_type,

            "location": scan.location,

            "scanned_at": scan.scanned_at.strftime(
                "%Y-%m-%d %H:%M"
            ),
        })

    return Response({

        "user_id": user.id,

        "full_name": user.full_name,

        "vehicle_number": user.vehicle_number,

        "vehicle_status": "Active",

        "qr_status": "Generated",

        "contacts_count": contacts_count,

        "privacy": (
            user.privacy.capitalize()
            if user.privacy
            else "Protected"
        ),

        "registered_on": user.created_at.strftime("%d %b %Y"),

        "recent_scans": recent_scans,
    })


# ============================================================
# SCAN HISTORY
# ============================================================

@api_view(["GET"])
def scan_history(request, user_id):

    try:

        user = User.objects.get(
            id=user_id
        )

    except User.DoesNotExist:

        return Response({
            "error": "User not found."
        }, status=404)

    scans = []

    for scan in user.scan_activities.order_by(
        "-scanned_at"
    ):

        scans.append({

            "id": scan.id,

            "activity_type": scan.activity_type,

            "location": scan.location,

            "scanned_at": scan.scanned_at.strftime(
                "%Y-%m-%d %H:%M"
            ),
        })

    return Response(scans)


# ============================================================
# LOG SCAN
# ============================================================

@api_view(["POST"])
def log_scan(request):

    user_id = request.data.get("user_id")

    location = request.data.get(
        "location",
        "Scanned via QR"
    )

    activity_type = request.data.get(
        "activity_type",
        "QR Scanned"
    )

    if not user_id:

        return Response({
            "error": "user_id is required."
        }, status=400)

    try:

        user = User.objects.get(
            id=user_id
        )

    except User.DoesNotExist:

        return Response({
            "error": "User not found."
        }, status=404)

    # ========================================================
    # CHECK FOR RAPID DUPLICATE SCAN (Within 5 seconds)
    # ========================================================

    recent_scan = ScanActivity.objects.filter(
        user=user,
        activity_type=activity_type,
        scanned_at__gte=timezone.now() - timedelta(seconds=5)
    ).first()

    if recent_scan:
        return Response({
            "message": "Scan already logged",
            "id": recent_scan.id,
        })

    # ========================================================
    # SAVE SCAN ACTIVITY
    # ========================================================

    scan = ScanActivity.objects.create(

        user=user,

        location=location,

        activity_type=activity_type,
    )

    # ========================================================
    # CREATE NOTIFICATION
    # ========================================================

    Notification.objects.create(

        user=user,

        title="QR Code Scanned",

        message=(
            "Your ParkSafe QR code was scanned successfully."
        ),
    )

    return Response({

        "message": "Scan logged successfully",

        "id": scan.id,

    })

# ============================================================
# USER PROFILE
# ============================================================

@api_view(["GET", "PUT", "PATCH"])
def user_profile(request, user_id):

    try:

        user = User.objects.get(
            id=user_id
        )

    except User.DoesNotExist:

        return Response({
            "error": "User not found."
        }, status=404)

    if request.method == "GET":

        return Response({

            "id": user.id,

            "fullName": user.full_name,

            "email": user.email,

            "mobile": user.mobile_number,

            "vehicleNumber": user.vehicle_number,

            "bloodGroup": user.blood_group,

            "medicalInfo": user.medical_condition,

            "privacy": (
                user.privacy.capitalize()
                if user.privacy
                else "Private"
            ),
        })

    if request.method in ["PUT", "PATCH"]:

        if "fullName" in request.data:
            user.full_name = str(request.data["fullName"]).strip()

        if "email" in request.data:
            email_val = request.data["email"]
            if email_val:
                email_val = str(email_val).strip()
                try:
                    validate_email(email_val)
                except ValidationError:
                    return Response({
                        "error": "Invalid email address format."
                    }, status=400)

                if User.objects.filter(email__iexact=email_val).exclude(id=user.id).exists():
                    return Response({
                        "error": "Email is already registered with another account."
                    }, status=400)
                user.email = email_val
            else:
                user.email = None

        mobile_val = None
        if "mobile_number" in request.data:
            mobile_val = request.data["mobile_number"]
        elif "mobile" in request.data:
            mobile_val = request.data["mobile"]

        if mobile_val is not None:
            mobile_val = str(mobile_val).strip()
            if not mobile_val:
                return Response({
                    "error": "Mobile number cannot be empty."
                }, status=400)

            clean_mobile = "".join(filter(str.isdigit, mobile_val))
            if len(clean_mobile) < 10 or len(mobile_val) > 15:
                return Response({
                    "error": "Please enter a valid mobile number (10-15 digits)."
                }, status=400)

            if User.objects.filter(mobile_number=mobile_val).exclude(id=user.id).exists():
                return Response({
                    "error": "Mobile number is already registered with another account."
                }, status=400)

            user.mobile_number = mobile_val

        if "bloodGroup" in request.data:
            user.blood_group = request.data["bloodGroup"]

        if "medicalInfo" in request.data:
            user.medical_condition = request.data[
                "medicalInfo"
            ]

        if "privacy" in request.data:
            user.privacy = request.data[
                "privacy"
            ].lower()

        if "vehicleNumber" in request.data:
            user.vehicle_number = request.data[
                "vehicleNumber"
            ].strip().upper()

        user.save()

        return Response({

            "message": "Profile Updated Successfully!",

            "id": user.id,

            "fullName": user.full_name,

            "email": user.email,

            "mobile": user.mobile_number,

            "mobile_number": user.mobile_number,

            "vehicleNumber": user.vehicle_number,

            "bloodGroup": user.blood_group,

            "medicalInfo": user.medical_condition,

            "privacy": (
                user.privacy.capitalize()
                if user.privacy
                else "Private"
            ),
        })


# ============================================================
# EMERGENCY CONTACTS
# ============================================================

@api_view(["GET", "POST"])
def user_emergency_contacts(request, user_id):

    try:

        user = User.objects.get(
            id=user_id
        )

    except User.DoesNotExist:

        return Response({
            "error": "User not found."
        }, status=404)

    if request.method == "GET":

        contacts = []

        for contact in user.contacts.all():

            contacts.append({

                "id": contact.id,

                "name": contact.name,

                "number": contact.number,
            })

        return Response(contacts)

    if request.method == "POST":

        name = request.data.get(
            "name",
            ""
        ).strip()

        number = request.data.get(
            "number",
            ""
        ).strip()

        if not name or not number:

            return Response({
                "error": "Name and number are required."
            }, status=400)

        contact = EmergencyContact.objects.create(

            user=user,

            name=name,

            number=number,
        )

        return Response({

            "message": "Contact added successfully",

            "id": contact.id,

            "name": contact.name,

            "number": contact.number,

        }, status=201)


# ============================================================
# EMERGENCY CONTACT DETAIL
# ============================================================

@api_view(["PUT", "DELETE"])
def emergency_contact_detail(
    request,
    contact_id
):

    try:

        contact = EmergencyContact.objects.get(
            id=contact_id
        )

    except EmergencyContact.DoesNotExist:

        return Response({
            "error": "Contact not found."
        }, status=404)

    if request.method == "PUT":

        name = request.data.get(
            "name",
            ""
        ).strip()

        number = request.data.get(
            "number",
            ""
        ).strip()

        if not name or not number:

            return Response({
                "error": "Name and number are required."
            }, status=400)

        contact.name = name
        contact.number = number

        contact.save()

        return Response({

            "message": "Contact updated successfully",

            "id": contact.id,

            "name": contact.name,

            "number": contact.number,
        })

    if request.method == "DELETE":

        contact.delete()

        return Response({
            "message": "Contact deleted successfully"
        })


# ============================================================
# 🧹 CLEAR SCAN HISTORY
# ============================================================

@api_view(["DELETE"])
def clear_scan_history(request, user_id):

    try:

        user = User.objects.get(
            id=user_id
        )

    except User.DoesNotExist:

        return Response({
            "error": "User not found."
        }, status=404)

    deleted_count, _ = ScanActivity.objects.filter(
        user=user
    ).delete()

    return Response({

        "message": "Scan history cleared successfully.",

        "deleted_count": deleted_count
    })


# ============================================================
# 📥 DOWNLOAD MY DATA
# ============================================================

@api_view(["GET"])
def download_my_data(request, user_id):

    try:

        user = User.objects.get(
            id=user_id
        )

    except User.DoesNotExist:

        return Response({
            "error": "User not found."
        }, status=404)

    contacts = []

    for contact in user.contacts.all():

        contacts.append({

            "id": contact.id,

            "name": contact.name,

            "number": contact.number
        })

    scans = []

    for scan in user.scan_activities.order_by(
        "-scanned_at"
    ):

        scans.append({

            "id": scan.id,

            "activity_type": scan.activity_type,

            "location": scan.location,

            "scanned_at": scan.scanned_at.strftime(
                "%Y-%m-%d %H:%M:%S"
            )
        })

    data = {

        "profile": {

            "id": user.id,

            "full_name": user.full_name,

            "mobile_number": user.mobile_number,

            "email": user.email,

            "privacy": user.privacy,

            "vehicle_number": user.vehicle_number,

            "blood_group": user.blood_group,

            "medical_condition": user.medical_condition,

            "created_at": user.created_at.strftime(
                "%Y-%m-%d %H:%M:%S"
            ),
        },

        "emergency_contacts": contacts,

        "scan_history": scans,
    }

    response = JsonResponse(
        data,
        json_dumps_params={
            "indent": 4
        }
    )

    response["Content-Disposition"] = (
        'attachment; filename="parksafe_my_data.json"'
    )

    return response


# ============================================================
# 🗑️ DELETE ACCOUNT
# ============================================================

@api_view(["DELETE"])
def delete_account(request, user_id):

    try:

        user = User.objects.get(
            id=user_id
        )

    except User.DoesNotExist:

        return Response({
            "error": "User not found."
        }, status=404)

    user_name = user.full_name

    user.delete()

    return Response({

        "message": "Account deleted successfully.",

        "user_name": user_name
    })


# ============================================================
# 🚪 LOGOUT
# ============================================================

@api_view(["POST"])
def logout_user(request):

    return Response({

        "message": "Logout successful."
    })


# ============================================================
# 🔔 GET NOTIFICATIONS
# ============================================================

@api_view(["GET"])
def get_notifications(request, user_id):

    try:

        user = User.objects.get(
            id=user_id
        )

    except User.DoesNotExist:

        return Response({
            "error": "User not found."
        }, status=404)

    notifications = []

    for notification in user.notifications.order_by(
        "-created_at"
    ):

        notifications.append({

            "id": notification.id,

            "title": notification.title,

            "message": notification.message,

            "is_read": notification.is_read,

            "created_at": notification.created_at.strftime(
                "%Y-%m-%d %H:%M"
            ),
        })

    unread_count = user.notifications.filter(
        is_read=False
    ).count()

    return Response({

        "notifications": notifications,

        "unread_count": unread_count
    })


# ============================================================
# 🔔 CREATE NOTIFICATION
# ============================================================

@api_view(["POST"])
def create_notification(request, user_id):

    try:

        user = User.objects.get(
            id=user_id
        )

    except User.DoesNotExist:

        return Response({
            "error": "User not found."
        }, status=404)

    title = request.data.get(
        "title",
        ""
    ).strip()

    message = request.data.get(
        "message",
        ""
    ).strip()

    if not title or not message:

        return Response({

            "error": "Title and message are required."

        }, status=400)

    notification = Notification.objects.create(

        user=user,

        title=title,

        message=message,
    )

    return Response({

        "message": "Notification created successfully.",

        "notification": {

            "id": notification.id,

            "title": notification.title,

            "message": notification.message,

            "is_read": notification.is_read,

            "created_at": notification.created_at.strftime(
                "%Y-%m-%d %H:%M"
            ),
        }

    }, status=201)


# ============================================================
# 🔔 MARK NOTIFICATION AS READ
# ============================================================

@api_view(["PATCH"])
def mark_notification_read(
    request,
    notification_id
):

    try:

        notification = Notification.objects.get(
            id=notification_id
        )

    except Notification.DoesNotExist:

        return Response({
            "error": "Notification not found."
        }, status=404)

    notification.is_read = True
    notification.save()

    return Response({

        "message": "Notification marked as read.",

        "id": notification.id,

        "is_read": notification.is_read
    })


# ============================================================
# 🔔 MARK ALL NOTIFICATIONS AS READ
# ============================================================

@api_view(["PATCH"])
def mark_all_notifications_read(
    request,
    user_id
):

    try:

        user = User.objects.get(
            id=user_id
        )

    except User.DoesNotExist:

        return Response({
            "error": "User not found."
        }, status=404)

    updated_count = user.notifications.filter(
        is_read=False
    ).update(
        is_read=True
    )

    return Response({

        "message": "All notifications marked as read.",

        "updated_count": updated_count
    })


# ============================================================
# 🔔 DELETE NOTIFICATION
# ============================================================

@api_view(["DELETE"])
def delete_notification(
    request,
    notification_id
):

    try:

        notification = Notification.objects.get(
            id=notification_id
        )

    except Notification.DoesNotExist:

        return Response({
            "error": "Notification not found."
        }, status=404)

    user_id = request.query_params.get("user_id") or request.data.get("user_id")
    if user_id and str(notification.user_id) != str(user_id):
        return Response({
            "error": "Unauthorized to delete this notification."
        }, status=403)

    notification.delete()

    return Response({
        "message": "Notification deleted successfully.",
        "id": notification_id
    })


# ============================================================
# ℹ️ ABOUT US
# ============================================================

@api_view(["GET"])
def about_us(request):

    return Response({

        "app_name": "ParkSafe QR",

        "tagline": "Your Safety, Our Priority.",

        "description": (
            "ParkSafe QR is a smart vehicle safety solution "
            "that helps vehicle owners share important "
            "vehicle and emergency information through a "
            "secure QR code."
        ),

        "features": [

            "Secure QR Code",

            "Emergency Contact Information",

            "Vehicle Information",

            "Scan Activity History",

            "Privacy Protection",

            "Easy Access to Safety Information"

        ],

        "version": "1.0.0",

        "support_email": "mohitesayali630@gmail.com",

        "copyright": "© 2026 ParkSafe QR"
    }) 

# ============================================================
# 📄 DOWNLOAD MY DATA AS PDF
# ============================================================

@api_view(["GET"])
def download_my_data_pdf(request, user_id):

    try:
        user = User.objects.get(id=user_id)

    except User.DoesNotExist:
        return Response(
            {
                "error": "User not found."
            },
            status=404
        )

    contacts = user.contacts.all()

    scans = user.scan_activities.order_by("-scanned_at")

    response = HttpResponse(
        content_type="application/pdf"
    )

    response["Content-Disposition"] = (
        'attachment; filename="parksafe_my_data.pdf"'
    )

    pdf = canvas.Canvas(
        response,
        pagesize=A4
    )

    width, height = A4

    left_margin = 20 * mm

    y = height - 25 * mm

    # ========================================================
    # HELPER FUNCTION
    # ========================================================

    def new_page_if_needed(required_space=20 * mm):

        nonlocal y

        if y < required_space:

            pdf.showPage()

            y = height - 25 * mm

    def write_line(
        text,
        font="Helvetica",
        size=10,
        gap=6
    ):

        nonlocal y

        new_page_if_needed()

        pdf.setFont(
            font,
            size
        )

        pdf.drawString(
            left_margin,
            y,
            str(text)
        )

        y -= gap * mm

    # ========================================================
    # HEADER
    # ========================================================

    write_line(
        "ParkSafe QR",
        "Helvetica-Bold",
        20,
        9
    )

    write_line(
        "My Personal Data",
        "Helvetica",
        11,
        12
    )

    # ========================================================
    # PROFILE
    # ========================================================

    write_line(
        "PROFILE",
        "Helvetica-Bold",
        14,
        8
    )

    write_line(
        f"Name: {user.full_name or '-'}"
    )

    write_line(
        f"Email: {user.email or '-'}"
    )

    write_line(
        f"Mobile Number: {user.mobile_number or '-'}"
    )

    write_line(
        f"Vehicle Number: {user.vehicle_number or '-'}"
    )

    write_line(
        f"Blood Group: {user.blood_group or '-'}"
    )

    write_line(
        f"Medical Condition: {user.medical_condition or '-'}"
    )

    write_line(
        f"Privacy: {user.privacy or '-'}"
    )

    if user.created_at:

        write_line(
            "Account Created: "
            + user.created_at.strftime(
                "%Y-%m-%d %H:%M:%S"
            )
        )

    y -= 5 * mm

    # ========================================================
    # EMERGENCY CONTACTS
    # ========================================================

    write_line(
        "EMERGENCY CONTACTS",
        "Helvetica-Bold",
        14,
        8
    )

    if contacts.exists():

        for contact in contacts:

            write_line(
                f"Name: {contact.name}"
            )

            write_line(
                f"Number: {contact.number}"
            )

            y -= 2 * mm

    else:

        write_line(
            "No emergency contacts added."
        )

    y -= 5 * mm

    # ========================================================
    # SCAN HISTORY
    # ========================================================

    write_line(
        "SCAN HISTORY",
        "Helvetica-Bold",
        14,
        8
    )

    if scans.exists():

        for scan in scans:

            write_line(
                f"Activity: {scan.activity_type}"
            )

            write_line(
                f"Location: {scan.location}"
            )

            write_line(
                "Date & Time: "
                + scan.scanned_at.strftime(
                    "%Y-%m-%d %H:%M:%S"
                )
            )

            y -= 3 * mm

    else:

        write_line(
            "No scan history available."
        )

    # ========================================================
    # FOOTER
    # ========================================================

    new_page_if_needed(20 * mm)

    y -= 8 * mm

    pdf.setFont(
        "Helvetica",
        9
    )

    pdf.drawString(
        left_margin,
        y,
        "ParkSafe QR - Your Safety, Our Priority"
    )

    # ========================================================
    # SAVE PDF
    # ========================================================

    pdf.save()

    return response

@csrf_exempt
def proxy_send_otp(request):
    if request.method != "POST":
        return JsonResponse(
            {"error": "POST method required"},
            status=405
        )

    try:
        data = json.loads(request.body)

        response = requests.post(
            "https://bargiee.microdynamicsoftware.uk/api/otp/send",
            json={
                "mobile": data.get("mobile"),
                "source": "web"
            },
            timeout=30
        )

        return JsonResponse(
            response.json(),
            status=response.status_code,
            safe=False
        )

    except requests.RequestException as e:
        return JsonResponse(
            {"error": f"OTP service error: {str(e)}"},
            status=502
        )

    except Exception as e:
        return JsonResponse(
            {"error": str(e)},
            status=500
        )


@csrf_exempt
def proxy_verify_otp(request):
    if request.method != "POST":
        return JsonResponse(
            {"error": "POST method required"},
            status=405
        )

    try:
        data = json.loads(request.body)

        response = requests.post(
            "https://bargiee.microdynamicsoftware.uk/api/otp/verify",
            json={
                "mobile": data.get("mobile"),
                "otp": data.get("otp"),
                "source": "web"
            },
            timeout=30
        )

        return JsonResponse(
            response.json(),
            status=response.status_code,
            safe=False
        )

    except requests.RequestException as e:
        return JsonResponse(
            {"error": f"OTP service error: {str(e)}"},
            status=502
        )

    except Exception as e:
        return JsonResponse(
            {"error": str(e)},
            status=500
        )