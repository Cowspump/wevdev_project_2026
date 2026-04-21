from rest_framework import viewsets
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import Task, ScheduleEntry
from .serializers import TaskSerializer, ScheduleEntrySerializer


class TaskViewSet(viewsets.ModelViewSet):
    serializer_class = TaskSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Task.objects.filter(user=self.request.user).order_by('-created_at')

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class ScheduleViewSet(viewsets.ModelViewSet):
    serializer_class = ScheduleEntrySerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return ScheduleEntry.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def ai_suggest(request):
    tasks = Task.objects.filter(user=request.user)

    if not tasks.exists():
        return Response({'suggestion': 'You have no tasks. Create some to get started!'})

    with_deadline = tasks.filter(due_date__isnull=False).order_by('due_date')
    if with_deadline.exists():
        task = with_deadline.first()
        return Response({
            'suggestion': f'Start with "{task.title}" - deadline is coming soon.',
            'task_id': task.id,
        })

    task = tasks.order_by('-created_at').first()
    return Response({
        'suggestion': f'You are doing great! Try working on "{task.title}".',
        'task_id': task.id,
    })
