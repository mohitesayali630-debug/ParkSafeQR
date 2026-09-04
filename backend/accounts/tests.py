from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status
from .models import User

class ProfileAPITests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user1 = User.objects.create(
            full_name="John Doe",
            mobile_number="9876543210",
            email="john@example.com",
            password="hashed_pass_test",
            privacy="private",
            vehicle_number="MH12AB1234",
            blood_group="B+",
            medical_condition="None",
        )
        self.user2 = User.objects.create(
            full_name="Jane Smith",
            mobile_number="9123456780",
            email="jane@example.com",
            password="hashed_pass_test",
            privacy="private",
            vehicle_number="MH14XY5678",
            blood_group="O+",
            medical_condition="None",
        )

    def test_get_profile(self):
        response = self.client.get(f"/api/profile/{self.user1.id}/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["fullName"], "John Doe")
        self.assertEqual(response.data["email"], "john@example.com")
        self.assertEqual(response.data["mobile"], "9876543210")

    def test_patch_profile_email_and_mobile(self):
        payload = {
            "fullName": "John Updated",
            "email": "john.new@example.com",
            "mobile_number": "9998887776",
            "bloodGroup": "A+",
            "medicalInfo": "Diabetes",
        }
        response = self.client.patch(f"/api/profile/{self.user1.id}/", payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["fullName"], "John Updated")
        self.assertEqual(response.data["email"], "john.new@example.com")
        self.assertEqual(response.data["mobile"], "9998887776")
        self.assertEqual(response.data["bloodGroup"], "A+")
        self.assertEqual(response.data["medicalInfo"], "Diabetes")

        # Verify DB persistence
        self.user1.refresh_from_db()
        self.assertEqual(self.user1.full_name, "John Updated")
        self.assertEqual(self.user1.email, "john.new@example.com")
        self.assertEqual(self.user1.mobile_number, "9998887776")
        self.assertEqual(self.user1.blood_group, "A+")
        self.assertEqual(self.user1.medical_condition, "Diabetes")

    def test_patch_duplicate_mobile(self):
        payload = {
            "mobile_number": "9123456780", # Already used by user2
        }
        response = self.client.patch(f"/api/profile/{self.user1.id}/", payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("error", response.data)

    def test_patch_invalid_email(self):
        payload = {
            "email": "not-an-email",
        }
        response = self.client.patch(f"/api/profile/{self.user1.id}/", payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("error", response.data)


class ScanActivityAPITests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create(
            full_name="Alex Rider",
            mobile_number="9876500000",
            email="alex@example.com",
            password="hashed_pass_test",
            privacy="private",
            vehicle_number="MH12CD5678",
            blood_group="O+",
            medical_condition="None",
        )

    def test_log_scan_single_record(self):
        payload = {
            "user_id": self.user.id,
            "location": "ParkSafe QR Scan",
            "activity_type": "QR Scanned",
        }
        response = self.client.post("/api/log-scan/", payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # Database should have exactly 1 record
        self.assertEqual(self.user.scan_activities.count(), 1)
        self.assertEqual(self.user.notifications.count(), 1)

    def test_log_scan_debounce_rapid_duplicates(self):
        payload = {
            "user_id": self.user.id,
            "location": "ParkSafe QR Scan",
            "activity_type": "QR Scanned",
        }
        # First call
        res1 = self.client.post("/api/log-scan/", payload, format="json")
        self.assertEqual(res1.status_code, status.HTTP_200_OK)

        # Immediate second duplicate call (e.g. strictmode or double frame)
        res2 = self.client.post("/api/log-scan/", payload, format="json")
        self.assertEqual(res2.status_code, status.HTTP_200_OK)
        self.assertEqual(res2.data["message"], "Scan already logged")

        # Database should STILL have only 1 record
        self.assertEqual(self.user.scan_activities.count(), 1)
        self.assertEqual(self.user.notifications.count(), 1)

        # Verify dashboard-stats returns 1 scan
        dash_res = self.client.get(f"/api/dashboard-stats/{self.user.id}/")
        self.assertEqual(dash_res.status_code, status.HTTP_200_OK)
        self.assertEqual(len(dash_res.data["recent_scans"]), 1)

        # Verify scan-history returns 1 scan
        hist_res = self.client.get(f"/api/scan-history/{self.user.id}/")
        self.assertEqual(hist_res.status_code, status.HTTP_200_OK)
        self.assertEqual(len(hist_res.data), 1)


class NotificationAPITests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user1 = User.objects.create(
            full_name="User One",
            mobile_number="9876511111",
            email="user1@example.com",
            password="hashed_pass_test",
            privacy="private",
            vehicle_number="MH12AB0001",
            blood_group="A+",
            medical_condition="None",
        )
        self.user2 = User.objects.create(
            full_name="User Two",
            mobile_number="9876522222",
            email="user2@example.com",
            password="hashed_pass_test",
            privacy="private",
            vehicle_number="MH12AB0002",
            blood_group="B+",
            medical_condition="None",
        )
        from .models import Notification
        self.notif1 = Notification.objects.create(
            user=self.user1,
            title="Scan 1",
            message="Vehicle scanned 1",
            is_read=False,
        )
        self.notif2 = Notification.objects.create(
            user=self.user1,
            title="Scan 2",
            message="Vehicle scanned 2",
            is_read=False,
        )
        self.notif3 = Notification.objects.create(
            user=self.user2,
            title="Scan Other",
            message="Vehicle scanned other",
            is_read=False,
        )

    def test_get_notifications(self):
        response = self.client.get(f"/api/notifications/{self.user1.id}/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data["notifications"]), 2)
        self.assertEqual(response.data["unread_count"], 2)

    def test_mark_notification_read(self):
        response = self.client.patch(f"/api/notification/{self.notif1.id}/read/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.notif1.refresh_from_db()
        self.assertTrue(self.notif1.is_read)

    def test_delete_notification(self):
        # User 1 deletes notif1
        response = self.client.delete(f"/api/notification/{self.notif1.id}/delete/?user_id={self.user1.id}")
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # notif1 should be gone from DB
        from .models import Notification
        self.assertFalse(Notification.objects.filter(id=self.notif1.id).exists())

        # notif2 and notif3 must still exist
        self.assertTrue(Notification.objects.filter(id=self.notif2.id).exists())
        self.assertTrue(Notification.objects.filter(id=self.notif3.id).exists())

    def test_delete_notification_unauthorized(self):
        # User 2 tries to delete notif2 belonging to User 1
        response = self.client.delete(f"/api/notification/{self.notif2.id}/delete/?user_id={self.user2.id}")
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        from .models import Notification
        self.assertTrue(Notification.objects.filter(id=self.notif2.id).exists())


