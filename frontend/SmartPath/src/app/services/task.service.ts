import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Task {
  id?: number;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  urgency: 'not_urgent' | 'urgent';
  status: 'todo' | 'in_progress' | 'done';
  due_date: string | null;
  estimated_minutes: number;
  course: string;
  created_at?: string;
  updated_at?: string;
}

export interface AiSuggestion {
  suggestion: string;
  task_id?: number;
}

@Injectable({ providedIn: 'root' })
export class TaskService {
  private http = inject(HttpClient);
  private api = 'http://localhost:8000/api/tasks/';

  getTasks(): Observable<Task[]> {
    return this.http.get<Task[]>(this.api);
  }

  getTask(id: number): Observable<Task> {
    return this.http.get<Task>(`${this.api}${id}/`);
  }

  createTask(task: Partial<Task>): Observable<Task> {
    return this.http.post<Task>(this.api, task);
  }

  updateTask(id: number, task: Partial<Task>): Observable<Task> {
    return this.http.put<Task>(`${this.api}${id}/`, task);
  }

  deleteTask(id: number): Observable<void> {
    return this.http.delete<void>(`${this.api}${id}/`);
  }

  getAiSuggestion(): Observable<AiSuggestion> {
    return this.http.get<AiSuggestion>(`${this.api}ai-suggest/`);
  }
}
