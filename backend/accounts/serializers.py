from rest_framework import serializers
from django.contrib.auth.hashers import make_password
from .models import User, EmergencyContact, ScanActivity


class EmergencyContactSerializer(serializers.ModelSerializer):
    class Meta:
        model = EmergencyContact
        fields = "__all__"


class ScanActivitySerializer(serializers.ModelSerializer):
    class Meta:
        model = ScanActivity
        fields = "__all__"


class EmergencyContactSerializer(serializers.ModelSerializer):
    class Meta:
        model = EmergencyContact
        fields = [
            "name",
            "number",
        ]


class UserSerializer(serializers.ModelSerializer):

    contacts = EmergencyContactSerializer(
        many=True,
        required=False
    )

    class Meta:
        model = User
        fields = "__all__"

    def create(self, validated_data):

        contacts_data = validated_data.pop("contacts", [])

        validated_data["password"] = make_password(
            validated_data["password"]
        )

        user = User.objects.create(**validated_data)

        for contact in contacts_data:
            EmergencyContact.objects.create(
                user=user,
                name=contact["name"],
                number=contact["number"]
            )

        return user


class UserProfileSerializer(serializers.ModelSerializer):
    contacts = EmergencyContactSerializer(many=True, read_only=True)

    class Meta:
        model = User
        fields = [
            "id",
            "full_name",
            "mobile_number",
            "email",
            "privacy",
            "vehicle_number",
            "blood_group",
            "medical_condition",
            "created_at",
            "contacts",
        ]
        read_only_fields = ["mobile_number"]