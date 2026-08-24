from django.contrib import admin
from .models import User, EmergencyContact, ScanActivity

admin.site.register(User)
admin.site.register(EmergencyContact)
admin.site.register(ScanActivity)