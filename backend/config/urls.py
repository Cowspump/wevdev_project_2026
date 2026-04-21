from django.contrib import admin
from django.http import HttpResponse
from django.urls import path, include


def root(_request):
    return HttpResponse(
        "SmartPath API — use /api/auth/, /api/tasks/, /api/notifications/. "
        "Angular app: http://localhost:4200",
        content_type="text/plain; charset=utf-8",
    )


urlpatterns = [
    path('', root),
    path('admin/', admin.site.urls),
    path('api/auth/', include('users.urls')),
    path('api/tasks/', include('tasks.urls')),
    path('api/notifications/', include('notifications.urls')),
]
