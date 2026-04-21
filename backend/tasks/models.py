from django.db import models
from django.conf import settings


class Task(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='tasks')
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True, default='')
    time = models.CharField(max_length=5, blank=True, default='')  # "14:30"
    day_of_week = models.IntegerField(default=0)  # 0=Mon, 6=Sun
    done = models.BooleanField(default=False)
    due_date = models.DateField(null=True, blank=True)  # deadline
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
