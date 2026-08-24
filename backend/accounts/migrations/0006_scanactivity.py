# Generated for ScanActivity model

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0005_otp'),
    ]

    operations = [
        migrations.CreateModel(
            name='ScanActivity',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('activity_type', models.CharField(default='QR Scanned', max_length=50)),
                ('location', models.CharField(default='Scan Location', max_length=150)),
                ('scanned_at', models.DateTimeField(auto_now_add=True)),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='scan_activities', to='accounts.user')),
            ],
        ),
    ]
