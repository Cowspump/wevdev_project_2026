import { Injectable } from '@angular/core';

export interface Task {
  title: string;
  description: string;
  time: string;
  deadline: string;          // ISO date string yyyy-MM-dd or ''
}

export type DeadlineColor = 'green' | 'yellow' | 'red' | '';

export interface DayColumn {
  name: string;
  shortName: string;
  date: string;
  rawDate: Date;
  tasks: Task[];
}

@Injectable({ providedIn: 'root' })
export class TaskService {
  days: DayColumn[] = [];

  private readonly dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  private readonly shortDayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  constructor() {
    this.buildWeek();
  }

  private buildWeek(): void {
    const today = new Date();
    const dow = today.getDay();
    const mondayOffset = dow === 0 ? -6 : 1 - dow;

    this.days = this.dayNames.map((name, i) => {
      const d = new Date(today);
      d.setDate(today.getDate() + mondayOffset + i);
      return {
        name,
        shortName: this.shortDayNames[i],
        date: d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }),
        rawDate: new Date(d.getFullYear(), d.getMonth(), d.getDate()),
        tasks: []
      };
    });
  }

  getTodayIndex(): number {
    const dow = new Date().getDay();
    return dow === 0 ? 6 : dow - 1;
  }

  /** Days left until deadline. Negative = overdue. */
  daysUntilDeadline(task: Task): number | null {
    if (!task.deadline) return null;
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const dl = new Date(task.deadline + 'T00:00:00');
    return Math.floor((dl.getTime() - today.getTime()) / 86_400_000);
  }

  deadlineColor(task: Task): DeadlineColor {
    const d = this.daysUntilDeadline(task);
    if (d === null) return '';
    if (d <= 0) return 'red';       // overdue or today
    if (d <= 2) return 'yellow';    // 1-2 days
    return 'green';                 // 3+ days
  }

  deadlineLabel(task: Task): string {
    const d = this.daysUntilDeadline(task);
    if (d === null) return '';
    if (d < 0) return `${Math.abs(d)}d overdue`;
    if (d === 0) return 'Due today';
    if (d === 1) return 'Due tomorrow';
    return `${d}d left`;
  }

  getAllTasks(): { task: Task; day: string; dayIndex: number }[] {
    const all: { task: Task; day: string; dayIndex: number }[] = [];
    for (let i = 0; i < this.days.length; i++) {
      for (const task of this.days[i].tasks) {
        all.push({ task, day: this.days[i].shortName, dayIndex: i });
      }
    }
    return all;
  }

  /** Returns prioritized advice: what to do first, based on deadlines + day order. */
  getPriorityAdvice(): string {
    const all = this.getAllTasks();
    if (all.length === 0) return 'No tasks yet — add some to get advice!';

    // Score: lower = more urgent. overdue < today < tomorrow < etc.
    const scored = all.map(entry => {
      const d = this.daysUntilDeadline(entry.task);
      const deadlineScore = d !== null ? d : 999;
      // tie-break: earlier day in the week first
      return { ...entry, score: deadlineScore * 10 + entry.dayIndex };
    }).sort((a, b) => a.score - b.score);

    const top = scored[0];
    const dl = this.daysUntilDeadline(top.task);
    let reason: string;
    if (dl !== null && dl < 0) reason = `it's ${Math.abs(dl)} day(s) overdue`;
    else if (dl === 0) reason = "it's due today";
    else if (dl === 1) reason = "it's due tomorrow";
    else if (dl !== null) reason = `deadline in ${dl} days`;
    else reason = `it's the earliest task (${top.day})`;

    let msg = `Start with "${top.task.title}" — ${reason}.`;

    if (scored.length > 1) {
      const next = scored[1];
      msg += ` Then "${next.task.title}" on ${next.day}.`;
    }
    if (scored.length > 2) {
      msg += ` After that, ${scored.length - 2} more task(s) to go.`;
    }

    return msg;
  }

  getAdvice(): string[] {
    const tips: string[] = [];
    const allTasks = this.getAllTasks();
    const todayIdx = this.getTodayIndex();
    const todayTasks = this.days[todayIdx]?.tasks ?? [];

    if (allTasks.length === 0) {
      return ['You have no tasks yet. Add some to get personalized advice!'];
    }

    if (todayTasks.length === 0) {
      tips.push('Your today is free — great time to plan ahead or pick up tasks from busy days.');
    } else if (todayTasks.length >= 4) {
      tips.push(`You have ${todayTasks.length} tasks today — consider moving some to lighter days.`);
    } else {
      tips.push(`You have ${todayTasks.length} task(s) today — a manageable load, nice!`);
    }

    // Overdue / urgent deadlines
    const overdue = allTasks.filter(t => { const d = this.daysUntilDeadline(t.task); return d !== null && d < 0; });
    const dueToday = allTasks.filter(t => this.daysUntilDeadline(t.task) === 0);
    if (overdue.length > 0) {
      tips.push(`${overdue.length} task(s) are overdue! Handle them ASAP.`);
    }
    if (dueToday.length > 0) {
      tips.push(`${dueToday.length} task(s) due today — make sure to finish them.`);
    }

    // Busiest / lightest
    let maxCount = 0, minCount = Infinity;
    let busiestDay = '', lightestDay = '';
    for (const day of this.days) {
      if (day.tasks.length > maxCount) { maxCount = day.tasks.length; busiestDay = day.shortName; }
      if (day.tasks.length < minCount) { minCount = day.tasks.length; lightestDay = day.shortName; }
    }
    if (maxCount > minCount + 1) {
      tips.push(`${busiestDay} is your busiest day (${maxCount} tasks). Try moving something to ${lightestDay}.`);
    }

    // No time
    const noTime = allTasks.filter(t => !t.task.time);
    if (noTime.length > 0) {
      tips.push(`${noTime.length} task(s) have no time set — scheduling them helps stay on track.`);
    }

    tips.push(`Total: ${allTasks.length} tasks this week. ${allTasks.length <= 10 ? 'Looking balanced!' : 'That\'s a lot — prioritize what matters most.'}`);

    return tips;
  }
}
