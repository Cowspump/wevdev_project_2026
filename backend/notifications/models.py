from django.db import models
from django.conf import settings


class Notification(models.Model):
    PRIORITY_CHOICES = [
        ('info', 'Info'),
        ('warning', 'Warning'),
        ('critical', 'Critical'),
    ]
    CATEGORY_CHOICES = [
        ('exam', 'Exam'),
        ('deadline', 'Deadline'),
        ('reminder', 'Reminder'),
        ('tip', 'Tip'),
    ]

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='notifications')
    title = models.CharField(max_length=200)
    message = models.TextField()
    priority = models.CharField(max_length=10, choices=PRIORITY_CHOICES, default='info')
    category = models.CharField(max_length=10, choices=CATEGORY_CHOICES, default='reminder')
    course = models.CharField(max_length=100, blank=True, default='')
    read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title
