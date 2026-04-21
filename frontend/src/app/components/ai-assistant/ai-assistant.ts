import { Component, inject, ElementRef, HostListener } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { TaskService } from '../../services/task.service';

@Component({
  selector: 'app-ai-assistant',
  standalone: true,
  templateUrl: './ai-assistant.html',
  styleUrl: './ai-assistant.css'
})
export class AiAssistantComponent {
  private taskService = inject(TaskService);
  private http = inject(HttpClient);
  private el = inject(ElementRef);

  open = false;
  tips: string[] = [];
  priorityAdvice = '';
  loading = false;

  toggle(): void {
    this.open = !this.open;
    if (this.open) {
      this.tips = this.taskService.getAdvice();
      this.priorityAdvice = '';
    }
  }

  askAdvice(): void {
    this.loading = true;
    this.priorityAdvice = '';
    this.http.get<{ suggestion: string }>('http://localhost:8000/api/tasks/ai-suggest/').subscribe({
      next: (res) => {
        this.priorityAdvice = res.suggestion;
        this.loading = false;
      },
      error: () => {
        this.priorityAdvice = this.taskService.getPriorityAdvice();
        this.loading = false;
      }
    });
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(e: MouseEvent): void {
    if (this.open && !this.el.nativeElement.contains(e.target)) {
      this.open = false;
    }
  }
}
