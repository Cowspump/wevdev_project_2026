import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TaskService, Task } from '../../services/task.service';

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class HomePageComponent implements OnInit {
  ts = inject(TaskService);

  ngOnInit(): void {
    this.ts.loadTasks();
  }

  get todoTasks(): { task: Task; day: string }[] {
    return this.ts.getAllTasks().filter(t => !t.task.done);
  }

  get doneTasks(): { task: Task; day: string }[] {
    return this.ts.getAllTasks().filter(t => t.task.done);
  }

  get urgentTasks(): { task: Task; day: string }[] {
    return this.ts.getAllTasks()
      .filter(t => !t.task.done && t.task.deadline)
      .sort((a, b) => {
        const da = this.ts.daysUntilDeadline(a.task) ?? 999;
        const db = this.ts.daysUntilDeadline(b.task) ?? 999;
        return da - db;
      })
      .slice(0, 5);
  }

  get totalTasks(): number {
    return this.ts.getAllTasks().length;
  }

  get priorityAdvice(): string {
    return this.ts.getPriorityAdvice();
  }
}
