from django.contrib.auth.hashers import make_password
from django.db import migrations


def seed_admin(apps, schema_editor):
    User = apps.get_model('users', 'User')
    if User.objects.filter(username='admin').exists():
        return
    user = User(
        email='admin@smartpath.local',
        username='admin',
        password=make_password('123456'),
        role='admin',
        is_staff=True,
        is_superuser=True,
        is_active=True,
    )
    user.save()


def unseed_admin(apps, schema_editor):
    User = apps.get_model('users', 'User')
    User.objects.filter(username='admin', email='admin@smartpath.local').delete()


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0001_initial'),
    ]

    operations = [
        migrations.RunPython(seed_admin, unseed_admin),
    ]
