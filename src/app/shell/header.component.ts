import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-header',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
  template: `
    <header class="bg-white/80 backdrop-blur-md border-b border-slate-200/80 h-16 flex items-center justify-between pl-2 pr-6 fixed w-full z-40 transition-all duration-300">
      <div class="flex items-center gap-4">
        <!-- Hamburger Menu Toggle -->
        <button 
          class="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          (click)="toggleSidebar.emit()"
          aria-label="Toggle sidebar"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <!-- App Logo -->
        <a href="#/" class="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <div class="flex items-center justify-center">
            <svg width="32" height="32" viewBox="-2 -2 36 36" xmlns="http://www.w3.org/2000/svg">
              <!-- Puzzle piece icon -->
              <path d="M 0,0 L 16,0 L 16,6.21 A 2.4 2.4 0 1 1 16 9.79 L 16,16 L 9.79,16 A 2.4 2.4 0 1 0 6.21 16 L 0,16 Z"
                    fill="#fadbd8" stroke="#c0392b" stroke-width="0.6" stroke-linejoin="round"/>
              <path d="M 0,16 L 6.21,16 A 2.4 2.4 0 1 1 9.79 16 L 16,16 L 16,22.21 A 2.4 2.4 0 1 0 16 25.79 L 16,32 L 0,32 Z"
                    fill="#d6eaf8" stroke="#2980b9" stroke-width="0.6" stroke-linejoin="round"/>
              <path d="M 16,32 L 16,25.79 A 2.4 2.4 0 1 1 16 22.21 L 16,16 L 22.21,16 A 2.4 2.4 0 1 0 25.79 16 L 32,16 L 32,32 Z"
                    fill="#d5f5e3" stroke="#27ae60" stroke-width="0.6" stroke-linejoin="round"/>
            </svg>
          </div>
          <div>
            <h1 class="text-xl font-bold text-slate-900 tracking-tight leading-none">APA</h1>
            <p class="text-xs text-slate-500 mt-0.5">Angular Plugin Platform</p>
          </div>
        </a>
      </div>

      <!-- Right Controls -->
      <div class="flex items-center gap-3 ml-auto">
        <!-- Search Pill -->
        <div class="hidden md:flex items-center gap-2 bg-slate-100/50 hover:bg-slate-100 border border-slate-200 rounded-xl px-3 py-2 transition-colors w-64">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input type="text" placeholder="Search..." class="bg-transparent text-sm w-full outline-none placeholder:text-slate-400 text-slate-700">
        </div>

        <div class="h-8 w-px bg-slate-200 mx-1"></div>

        <!-- Notification Pill -->
        <button class="h-10 w-10 flex items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 shadow-sm">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
        </button>

        <!-- User Widget -->
        <div class="flex items-center gap-2 pl-2 pr-4 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 shadow-sm transition-colors">
          <div class="h-7 w-7 rounded-lg bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-xs font-bold text-slate-600 border border-slate-300">
            U
          </div>
          <div class="text-left leading-tight">
            <p class="text-xs font-semibold text-slate-900">User</p>
          </div>
        </div>

        <!-- Header Components Extension Point -->
        @for (component of headerComponents(); track $index) {
          <ng-container [ngComponentOutlet]="component" />
        }
      </div>
    </header>
  `,
})
export class HeaderComponent {
  readonly sidebarCollapsed = input<boolean>(false);
  readonly headerComponents = input<any[]>([]);
  readonly toggleSidebar = output<void>();
}
