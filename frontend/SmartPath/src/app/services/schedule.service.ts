import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ScheduleEntry {
  id?: number;
  task?: number | null;
  title: string;
  day_of_week: number;  // 0 = monday, 6 = sunday
  start_hour: number;
  end_hour: number;
  color: string;
}

@Injectable({ providedIn: 'root' })
export class ScheduleService {
  private http = inject(HttpClient);
  private api = 'http://localhost:8000/api/tasks/schedule/';

  getSchedule(): Observable<ScheduleEntry[]> {
    return this.http.get<ScheduleEntry[]>(this.api);
  }

  createEntry(entry: Partial<ScheduleEntry>): Observable<ScheduleEntry> {
    return this.http.post<ScheduleEntry>(this.api, entry);
  }

  updateEntry(id: number, entry: Partial<ScheduleEntry>): Observable<ScheduleEntry> {
    return this.http.put<ScheduleEntry>(`${this.api}${id}/`, entry);
  }

  deleteEntry(id: number): Observable<void> {
    return this.http.delete<void>(`${this.api}${id}/`);
  }
}
