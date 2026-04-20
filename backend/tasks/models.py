from django.db import models
from django.conf import settings


class Task(models.Model):
    PRIORITY_CHOICES = [
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
    ]
    URGENCY_CHOICES = [
        ('not_urgent', 'Not Urgent'),
        ('urgent', 'Urgent'),
    ]
    STATUS_CHOICES = [
        ('todo', 'To Do'),
        ('in_progress', 'In Progress'),
        ('done', 'Done'),
    ]

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='tasks')
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True, default='')
    priority = models.CharField(max_length=10, choices=PRIORITY_CHOICES, default='medium')
    urgency = models.CharField(max_length=10, choices=URGENCY_CHOICES, default='not_urgent')
    status = models.CharField(max_length=15, choices=STATUS_CHOICES, default='todo')
    due_date = models.DateTimeField(null=True, blank=True)
    estimated_minutes = models.PositiveIntegerField(default=25)
    course = models.CharField(max_length=100, blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title


class ScheduleEntry(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='schedule')
    task = models.ForeignKey(Task, on_delete=models.SET_NULL, null=True, blank=True)
    title = models.CharField(max_length=200)
    day_of_week = models.IntegerField()
    start_hour = models.IntegerField()
    end_hour = models.IntegerField()
    color = models.CharField(max_length=7, default='#4CAF50')

    def __str__(self):
        return f"{self.title} - day {self.day_of_week}"
