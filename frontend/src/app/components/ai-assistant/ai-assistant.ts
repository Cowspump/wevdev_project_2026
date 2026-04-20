import { Component, inject, ElementRef, HostListener } from '@angular/core';
import { TaskService } from '../../services/task.service';

@Component({
  selector: 'app-ai-assistant',
  standalone: true,
  templateUrl: './ai-assistant.html',
  styleUrl: './ai-assistant.css'
})
export class AiAssistantComponent {
  private taskService = inject(TaskService);
  private el = inject(ElementRef);

  open = false;
  tips: string[] = [];
  priorityAdvice = '';

  toggle(): void {
    this.open = !this.open;
    if (this.open) {
      this.tips = this.taskService.getAdvice();
      this.priorityAdvice = '';
    }
  }

  askAdvice(): void {
    this.priorityAdvice = this.taskService.getPriorityAdvice();
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(e: MouseEvent): void {
    if (this.open && !this.el.nativeElement.contains(e.target)) {
      this.open = false;
    }
  }
}
