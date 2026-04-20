from django.contrib import admin
from .models import Task, ScheduleEntry

admin.site.register(Task)
admin.site.register(ScheduleEntry)
