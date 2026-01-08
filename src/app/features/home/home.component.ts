import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { PluginRegistryService } from '../../core/plugin-registry.service';

@Component({
  selector: 'app-home',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
  template: `
    <div class="max-w-4xl">
      <!-- Hero Section -->
      <div class="flex items-center gap-5 mb-6">
        <div class="flex-shrink-0">
          <svg width="56" height="56" viewBox="-2 -2 36 36" xmlns="http://www.w3.org/2000/svg">
            <path d="M 0,0 L 16,0 L 16,6.21 A 2.4 2.4 0 1 1 16 9.79 L 16,16 L 9.79,16 A 2.4 2.4 0 1 0 6.21 16 L 0,16 Z"
                  fill="#fadbd8" stroke="#c0392b" stroke-width="0.6" stroke-linejoin="round"/>
            <path d="M 0,16 L 6.21,16 A 2.4 2.4 0 1 1 9.79 16 L 16,16 L 16,22.21 A 2.4 2.4 0 1 0 16 25.79 L 16,32 L 0,32 Z"
                  fill="#d6eaf8" stroke="#2980b9" stroke-width="0.6" stroke-linejoin="round"/>
            <path d="M 16,32 L 16,25.79 A 2.4 2.4 0 1 1 16 22.21 L 16,16 L 22.21,16 A 2.4 2.4 0 1 0 25.79 16 L 32,16 L 32,32 Z"
                  fill="#d5f5e3" stroke="#27ae60" stroke-width="0.6" stroke-linejoin="round"/>
          </svg>
        </div>
        <div>
          <h1 class="text-2xl font-bold text-slate-900">Angular Plugin Architecture</h1>
          <p class="text-slate-600">A showcase of modular, extensible application design</p>
        </div>
      </div>

      <!-- Description -->
      <div class="bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl p-5 mb-6 border border-slate-200">
        <p class="text-slate-700 text-sm leading-relaxed">
          This application demonstrates a <strong>plugin-based architecture</strong> where features are self-contained modules 
          that register their own routes, navigation items, and settings through <strong>extension points</strong>. 
          New features can be added by creating a plugin and registering it in <code class="px-1.5 py-0.5 bg-slate-200 rounded text-xs">plugins.ts</code> — no changes to core code required.
        </p>
      </div>

      <!-- Stats Bar -->
      <div class="grid grid-cols-4 gap-3 mb-6">
        <div class="bg-white rounded-xl border border-slate-200 p-3 text-center">
          <p class="text-2xl font-bold text-slate-900">{{ pluginStats().total }}</p>
          <p class="text-xs text-slate-500">Plugins</p>
        </div>
        <div class="bg-white rounded-xl border border-slate-200 p-3 text-center">
          <p class="text-2xl font-bold text-green-600">{{ pluginStats().enabled }}</p>
          <p class="text-xs text-slate-500">Enabled</p>
        </div>
        <div class="bg-white rounded-xl border border-slate-200 p-3 text-center">
          <p class="text-2xl font-bold text-blue-600">{{ pluginStats().totalContributions }}</p>
          <p class="text-xs text-slate-500">Contributions</p>
        </div>
        <div class="bg-white rounded-xl border border-slate-200 p-3 text-center">
          <p class="text-2xl font-bold text-purple-600">8</p>
          <p class="text-xs text-slate-500">Extension Points</p>
        </div>
      </div>

      <!-- Quick Links -->
      <h2 class="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">Explore Features</h2>
      <div class="grid grid-cols-4 gap-3 mb-6">
        <button
          (click)="navigateTo('/utilities')"
          class="group p-4 bg-white rounded-xl border border-slate-200 hover:border-purple-300 hover:shadow-md transition-all text-left"
        >
          <div class="p-2 rounded-lg text-purple-600 bg-purple-50 w-fit mb-2">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
            </svg>
          </div>
          <h3 class="font-semibold text-slate-900 text-sm">Utilities</h3>
          <p class="text-xs text-slate-500">QR, passwords, kanban</p>
        </button>

        <button
          (click)="navigateTo('/extras/games')"
          class="group p-4 bg-white rounded-xl border border-slate-200 hover:border-emerald-300 hover:shadow-md transition-all text-left"
        >
          <div class="p-2 rounded-lg text-emerald-600 bg-emerald-50 w-fit mb-2">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 class="font-semibold text-slate-900 text-sm">Games</h3>
          <p class="text-xs text-slate-500">2048, Tetris</p>
        </button>

        <button
          (click)="navigateTo('/dev-tools')"
          class="group p-4 bg-white rounded-xl border border-slate-200 hover:border-orange-300 hover:shadow-md transition-all text-left"
        >
          <div class="p-2 rounded-lg text-orange-600 bg-orange-50 w-fit mb-2">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
            </svg>
          </div>
          <h3 class="font-semibold text-slate-900 text-sm">Dev Tools</h3>
          <p class="text-xs text-slate-500">Plugin inspector</p>
        </button>

        <button
          (click)="navigateTo('/settings')"
          class="group p-4 bg-white rounded-xl border border-slate-200 hover:border-slate-300 hover:shadow-md transition-all text-left"
        >
          <div class="p-2 rounded-lg text-slate-600 bg-slate-100 w-fit mb-2">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <h3 class="font-semibold text-slate-900 text-sm">Settings</h3>
          <p class="text-xs text-slate-500">Plugin preferences</p>
        </button>
      </div>

      <!-- Architecture Overview -->
      <h2 class="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">How It Works</h2>
      <div class="grid grid-cols-2 gap-4 mb-6">
        <!-- Extension Points -->
        <div class="bg-white rounded-xl border border-slate-200 p-4">
          <h3 class="font-semibold text-slate-900 mb-3 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Extension Points
          </h3>
          <div class="space-y-2 text-xs">
            <div class="flex items-center justify-between py-1.5 px-2 bg-slate-50 rounded">
              <code class="text-slate-700">NAV_ITEMS</code>
              <span class="text-slate-500">Sidebar navigation</span>
            </div>
            <div class="flex items-center justify-between py-1.5 px-2 bg-slate-50 rounded">
              <code class="text-slate-700">SETTINGS_SECTIONS</code>
              <span class="text-slate-500">Settings panels</span>
            </div>
            <div class="flex items-center justify-between py-1.5 px-2 bg-slate-50 rounded">
              <code class="text-slate-700">SIDEBAR_FOOTER_ACTIONS</code>
              <span class="text-slate-500">Footer buttons</span>
            </div>
            <div class="flex items-center justify-between py-1.5 px-2 bg-slate-50 rounded">
              <code class="text-slate-700">HEADER_COMPONENTS</code>
              <span class="text-slate-500">Header widgets</span>
            </div>
            <div class="flex items-center justify-between py-1.5 px-2 bg-slate-50 rounded">
              <code class="text-slate-700">SHELL_COMPONENT</code>
              <span class="text-slate-500">Override shell</span>
            </div>
          </div>
        </div>

        <!-- Core Principles -->
        <div class="bg-white rounded-xl border border-slate-200 p-4">
          <h3 class="font-semibold text-slate-900 mb-3 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Core Principles
          </h3>
          <ul class="space-y-2 text-xs text-slate-600">
            <li class="flex items-start gap-2">
              <span class="text-green-500 mt-0.5">✓</span>
              <span><strong class="text-slate-700">Plugins Only</strong> — Features added via plugins.ts</span>
            </li>
            <li class="flex items-start gap-2">
              <span class="text-green-500 mt-0.5">✓</span>
              <span><strong class="text-slate-700">No Cross-Imports</strong> — Plugins never import each other</span>
            </li>
            <li class="flex items-start gap-2">
              <span class="text-green-500 mt-0.5">✓</span>
              <span><strong class="text-slate-700">Extension Points</strong> — All communication via tokens</span>
            </li>
            <li class="flex items-start gap-2">
              <span class="text-green-500 mt-0.5">✓</span>
              <span><strong class="text-slate-700">Explicit Dependencies</strong> — Declared in dependsOn</span>
            </li>
            <li class="flex items-start gap-2">
              <span class="text-green-500 mt-0.5">✓</span>
              <span><strong class="text-slate-700">Forward Only</strong> — Depend on earlier plugins only</span>
            </li>
          </ul>
        </div>
      </div>

      <!-- Documentation Links -->
      <div class="flex items-center gap-6 text-sm text-slate-500 bg-white rounded-xl border border-slate-200 p-4">
        <div class="flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
          <span><strong class="text-slate-700">README.md</strong> — Full documentation</span>
        </div>
        <div class="h-4 w-px bg-slate-200"></div>
        <div class="flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
          </svg>
          <span><strong class="text-slate-700">AGENTS.md</strong> — Plugin guidelines</span>
        </div>
        <div class="h-4 w-px bg-slate-200"></div>
        <div class="flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
          </svg>
          <button 
            (click)="navigateTo('/dev-tools/plugins')"
            class="text-blue-600 hover:text-blue-700 font-medium"
          >
            Plugin Inspector →
          </button>
        </div>
      </div>
    </div>
  `,
})
export class HomeComponent {
  private readonly router = inject(Router);
  private readonly registry = inject(PluginRegistryService);

  protected readonly pluginStats = () => this.registry.getStats();

  protected navigateTo(path: string): void {
    this.router.navigate([path]);
  }
}
