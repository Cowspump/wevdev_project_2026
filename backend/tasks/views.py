from rest_framework import viewsets
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.conf import settings
from openai import OpenAI
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


DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']


def _fallback_suggest(tasks):
    """Simple suggestion without GPT — used when API key is missing or error."""
    if not tasks.exists():
        return 'You have no tasks. Create some to get started!'

    with_deadline = tasks.filter(due_date__isnull=False).order_by('due_date')
    if with_deadline.exists():
        task = with_deadline.first()
        return f'Start with "{task.title}" — deadline is coming soon.'

    task = tasks.order_by('-created_at').first()
    return f'Try working on "{task.title}".'


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def ai_suggest(request):
    tasks = Task.objects.filter(user=request.user)

    if not tasks.exists():
        return Response({'suggestion': 'You have no tasks. Create some to get started!'})

    # Build task list text for GPT
    lines = []
    for t in tasks:
        status = 'done' if t.done else 'not done'
        day = DAYS[t.day_of_week] if 0 <= t.day_of_week <= 6 else '?'
        deadline = str(t.due_date) if t.due_date else 'no deadline'
        time_str = t.time if t.time else 'no time'
        lines.append(f'- {t.title} | {day} | {time_str} | deadline: {deadline} | {status}')

    task_list_text = '\n'.join(lines)

    # Try GPT, fallback if no key or error
    api_key = settings.OPENAI_API_KEY
    if not api_key:
        return Response({'suggestion': _fallback_suggest(tasks)})

    try:
        client = OpenAI(api_key=api_key)
        response = client.chat.completions.create(
            model='gpt-4o-mini',
            messages=[
                {
                    'role': 'system',
                    'content': (
                        'You are a student productivity assistant. '
                        'The user will give you their task list for the week. '
                        'Analyze it and give a short, clear advice: '
                        'what to do first and why. Keep it under 3 sentences. '
                        'Be friendly and motivating.'
                    ),
                },
                {
                    'role': 'user',
                    'content': f'Here are my tasks:\n{task_list_text}',
                },
            ],
            max_tokens=200,
        )
        suggestion = response.choices[0].message.content.strip()
    except Exception:
        suggestion = _fallback_suggest(tasks)

    return Response({'suggestion': suggestion})
