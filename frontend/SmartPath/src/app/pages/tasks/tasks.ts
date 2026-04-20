import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TaskService, Task, AiSuggestion } from '../../services/task.service';

@Component({
  selector: 'app-tasks',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './tasks.html',
  styleUrl: './tasks.css',
})
export class TasksPage implements OnInit {
  private taskService = inject(TaskService);

  tasks = signal<Task[]>([]);
  suggestion = signal<AiSuggestion | null>(null);
  showForm = signal(false);
  editingTask = signal<Task | null>(null);
  filter = signal<string>('all');

  // form fields
  title = '';
  description = '';
  priority: 'low' | 'medium' | 'high' = 'medium';
  urgency: 'not_urgent' | 'urgent' = 'not_urgent';
  due_date = '';
  estimated_minutes = 25;
  course = '';

  ngOnInit() {
    this.loadTasks();
    this.loadSuggestion();
  }

  loadTasks() {
    this.taskService.getTasks().subscribe({
      next: (data) => this.tasks.set(data),
      error: (err) => console.log('error loading tasks', err),
    });
  }

  loadSuggestion() {
    this.taskService.getAiSuggestion().subscribe({
      next: (data) => this.suggestion.set(data),
      error: () => this.suggestion.set(null),
    });
  }

  get filteredTasks(): Task[] {
    const all = this.tasks();
    if (this.filter() === 'all') return all;
    return all.filter(t => t.status === this.filter());
  }

  openNewForm() {
    this.editingTask.set(null);
    this.resetForm();
    this.showForm.set(true);
  }

  editTask(task: Task) {
    this.editingTask.set(task);
    this.title = task.title;
    this.description = task.description;
    this.priority = task.priority;
    this.urgency = task.urgency;
    this.due_date = task.due_date ? task.due_date.slice(0, 16) : '';
    this.estimated_minutes = task.estimated_minutes;
    this.course = task.course;
    this.showForm.set(true);
  }

  saveTask() {
    const data: Partial<Task> = {
      title: this.title,
      description: this.description,
      priority: this.priority,
      urgency: this.urgency,
      due_date: this.due_date || null,
      estimated_minutes: this.estimated_minutes,
      course: this.course,
    };

    const editing = this.editingTask();
    if (editing && editing.id) {
      this.taskService.updateTask(editing.id, { ...editing, ...data }).subscribe({
        next: () => {
          this.showForm.set(false);
          this.loadTasks();
          this.loadSuggestion();
        }
      });
    } else {
      this.taskService.createTask(data).subscribe({
        next: () => {
          this.showForm.set(false);
          this.loadTasks();
          this.loadSuggestion();
        }
      });
    }
  }

  deleteTask(id: number) {
    this.taskService.deleteTask(id).subscribe({
      next: () => {
        this.loadTasks();
        this.loadSuggestion();
      }
    });
  }

  toggleStatus(task: Task) {
    let newStatus: 'todo' | 'in_progress' | 'done';
    if (task.status === 'todo') newStatus = 'in_progress';
    else if (task.status === 'in_progress') newStatus = 'done';
    else newStatus = 'todo';

    this.taskService.updateTask(task.id!, { ...task, status: newStatus }).subscribe({
      next: () => {
        this.loadTasks();
        this.loadSuggestion();
      }
    });
  }

  cancelForm() {
    this.showForm.set(false);
    this.resetForm();
  }

  private resetForm() {
    this.title = '';
    this.description = '';
    this.priority = 'medium';
    this.urgency = 'not_urgent';
    this.due_date = '';
    this.estimated_minutes = 25;
    this.course = '';
  }

  getPriorityClass(priority: string): string {
    if (priority === 'high') return 'badge-high';
    if (priority === 'medium') return 'badge-medium';
    return 'badge-low';
  }

  getStatusLabel(status: string): string {
    if (status === 'todo') return 'To Do';
    if (status === 'in_progress') return 'In Progress';
    return 'Done';
  }
}
