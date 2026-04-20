from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register('', views.TaskViewSet, basename='task')

schedule_router = DefaultRouter()
schedule_router.register('', views.ScheduleViewSet, basename='schedule')

urlpatterns = [
    path('ai-suggest/', views.ai_suggest),
    path('schedule/', include(schedule_router.urls)),
    path('', include(router.urls)),
]
