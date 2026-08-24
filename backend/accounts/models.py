from django.db import models
from django.utils import timezone
from datetime import timedelta


# ============================================================
# USER
# ============================================================

class User(models.Model):

    PRIVACY_CHOICES = [
        ("private", "Private"),
        ("public", "Public"),
    ]

    BLOOD_GROUPS = [
        ("A+", "A+"),
        ("A-", "A-"),
        ("B+", "B+"),
        ("B-", "B-"),
        ("AB+", "AB+"),
        ("AB-", "AB-"),
        ("O+", "O+"),
        ("O-", "O-"),
    ]

    MEDICAL_CONDITIONS = [
        ("None", "None"),
        ("Diabetes", "Diabetes"),
        ("Blood Pressure", "Blood Pressure"),
        ("Asthma", "Asthma"),
        ("Heart Patient", "Heart Patient"),
        ("Epilepsy", "Epilepsy"),
        ("Allergy", "Allergy"),
        ("Pregnant", "Pregnant"),
        ("Other", "Other"),
    ]

    full_name = models.CharField(max_length=100)

    mobile_number = models.CharField(
        max_length=15,
        unique=True
    )

    email = models.EmailField(
        blank=True,
        null=True
    )

    password = models.CharField(
        max_length=255
    )

    privacy = models.CharField(
        max_length=10,
        choices=PRIVACY_CHOICES,
        default="private"
    )

    vehicle_number = models.CharField(
        max_length=20
    )

    blood_group = models.CharField(
        max_length=5,
        choices=BLOOD_GROUPS
    )

    medical_condition = models.CharField(
        max_length=30,
        choices=MEDICAL_CONDITIONS,
        default="None"
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    def __str__(self):
        return self.full_name


# ============================================================
# EMERGENCY CONTACT
# ============================================================

class EmergencyContact(models.Model):

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="contacts"
    )

    name = models.CharField(
        max_length=100
    )

    number = models.CharField(
        max_length=15
    )

    def __str__(self):
        return f"{self.user.full_name} - {self.name}"


# ============================================================
# OTP
# ============================================================

class OTP(models.Model):

    email = models.EmailField()

    otp = models.CharField(
        max_length=6
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    expires_at = models.DateTimeField()

    is_verified = models.BooleanField(
        default=False
    )

    def save(self, *args, **kwargs):

        if not self.expires_at:
            self.expires_at = (
                timezone.now() +
                timedelta(minutes=5)
            )

        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.email} - {self.otp}"


# ============================================================
# SCAN ACTIVITY
# ============================================================

class ScanActivity(models.Model):

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="scan_activities"
    )

    activity_type = models.CharField(
        max_length=50,
        default="QR Scanned"
    )

    location = models.CharField(
        max_length=150,
        default="Scan Location"
    )

    scanned_at = models.DateTimeField(
        auto_now_add=True
    )

    def __str__(self):
        return (
            f"{self.user.full_name} - "
            f"{self.activity_type} at "
            f"{self.scanned_at}"
        )


# ============================================================
# 🔔 NOTIFICATION
# ============================================================

class Notification(models.Model):

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="notifications"
    )

    title = models.CharField(
        max_length=150
    )

    message = models.TextField()

    is_read = models.BooleanField(
        default=False
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    def __str__(self):
        return (
            f"{self.user.full_name} - "
            f"{self.title}"
        )