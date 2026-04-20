from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Notification',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('title', models.CharField(max_length=200)),
                ('message', models.TextField()),
                ('priority', models.CharField(choices=[('info', 'Info'), ('warning', 'Warning'), ('critical', 'Critical')], default='info', max_length=10)),
                ('category', models.CharField(choices=[('exam', 'Exam'), ('deadline', 'Deadline'), ('reminder', 'Reminder'), ('tip', 'Tip')], default='reminder', max_length=10)),
                ('course', models.CharField(blank=True, default='', max_length=100)),
                ('read', models.BooleanField(default=False)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
            ],
        ),
    ]
