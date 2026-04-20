import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { NotificationsService } from '../../services/notifications.service';
import { AuthService } from '../../services/auth.service';

export interface Feature {
  icon: string;
  iconBg: string;
  title: string;
  desc: string;
  route?: string;
}

export interface Task {
  name: string;
  done: boolean;
  tag: string;
  tagClass: string;
  time: string;
  active?: boolean;
}

export interface Step {
  num: number;
  title: string;
  desc: string;
}

export interface TimeBar {
  label: string;
  hours: string;
  widthPct: number;
  color: string;
}

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './landing.html',
  styleUrl: './landing.css',
})
export class LandingPage {
  private notifSvc = inject(NotificationsService);
  private authSvc = inject(AuthService);
  private router = inject(Router);

  readonly unreadCount = this.notifSvc.unreadCount;
  readonly user = this.authSvc.user;
  readonly isLoggedIn = this.authSvc.isLoggedIn;

  showUserMenu = signal(false);

  logout(): void {
    this.authSvc.logout();
  }

  features: Feature[] = [
    {
      icon: '📅',
      iconBg: '#ede9ff',
      title: 'Intelligent Daily Scheduling',
      desc: 'Automatically generates an optimal daily plan by adapting to your academic timetable and surfacing what matters most.',
      route: '/schedule',
    },
    {
      icon: '🧠',
      iconBg: '#e6f1fb',
      title: 'Proactive AI Mentor',
      desc: 'Analyzes your workload and tells you exactly what to do right now — your built-in digital strategist, always on call.',
    },
    {
      icon: '🎯',
      iconBg: '#faeeda',
      title: 'Smart Task Classification',
      desc: 'Distinguishes important from urgent from deferrable — so your energy always flows to where it counts most.',
    },
    {
      icon: '⏱',
      iconBg: '#e1f5ee',
      title: 'Deep Focus Mode',
      desc: 'Integrated Pomodoro timer breaks complex projects into focused intervals, keeping concentration at its peak.',
    },
    {
      icon: '🔔',
      iconBg: '#fceae7',
      title: 'Proactive Notifications',
      route: '/notifications',
      desc: 'Stay one step ahead of every deadline and exam. Our system keeps critical events on your radar well in advance.',
    },
    {
      icon: '🧘',
      iconBg: '#eaf3de',
      title: 'Work-Life Balance',
      desc: 'Our algorithms ensure success never comes at the cost of rest. Hobbies and recovery are built into your plan.',
    },
  ];

  tasks: Task[] = [
    { name: 'Morning review', done: true, tag: 'Done', tagClass: 'tag-rest', time: '08:00' },
    {
      name: 'Linear Algebra problem set',
      done: true,
      tag: 'Deep focus',
      tagClass: 'tag-focus',
      time: '09:30',
    },
    {
      name: 'Research paper draft — section 2',
      done: false,
      tag: 'Urgent',
      tagClass: 'tag-urgent',
      time: 'Now',
      active: true,
    },
    {
      name: 'Physics lab report',
      done: false,
      tag: 'Important',
      tagClass: 'tag-focus',
      time: '15:00',
    },
  ];

  steps: Step[] = [
    {
      num: 1,
      title: 'Set your profile',
      desc: 'Add your courses, goals, and the things that matter to you personally.',
    },
    {
      num: 2,
      title: 'Import your timetable',
      desc: 'SmartPath reads your academic schedule and locks in non-negotiable blocks.',
    },
    {
      num: 3,
      title: 'Get your plan',
      desc: 'AI generates a balanced daily rhythm — work, focus, and rest in harmony.',
    },
    {
      num: 4,
      title: 'Track & improve',
      desc: 'Weekly insights sharpen your workflow and reveal where time goes.',
    },
  ];

  timeBars: TimeBar[] = [
    { label: 'Deep study', hours: '18.5h', widthPct: 74, color: '#5b3cf5' },
    { label: 'Classes & lectures', hours: '12h', widthPct: 48, color: '#378add' },
    { label: 'Rest & recovery', hours: '9h', widthPct: 36, color: '#1d9e75' },
    { label: 'Hobbies & social', hours: '7h', widthPct: 28, color: '#ef9f27' },
    { label: 'Admin & planning', hours: '2.5h', widthPct: 10, color: '#b4b2a9' },
  ];
}

