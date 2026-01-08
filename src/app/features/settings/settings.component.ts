import { Component, ChangeDetectionStrategy, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { SETTINGS_SECTIONS, SettingsSection } from '../../core/application.plugin';

@Component({
  selector: 'app-settings',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
  template: `
    <div class="max-w-4xl">
      <div class="mb-6 md:mb-8">
        <h1 class="text-xl md:text-2xl font-bold text-slate-900 mb-2">Settings</h1>
        <p class="text-sm md:text-base text-slate-600">Configure your application preferences.</p>
      </div>

      <!-- Mobile: Horizontal scrollable tabs -->
      <div class="md:hidden mb-4 -mx-6 px-6">
        <div class="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          @for (section of sortedSections(); track section.id) {
            <button
              (click)="selectSection(section)"
              [class]="getMobileTabClass(section)"
            >
              @if (section.icon) {
                <span [innerHTML]="sanitizeIcon(section.icon)" class="flex-shrink-0"></span>
              }
              <span class="text-sm font-medium whitespace-nowrap">{{ section.label }}</span>
            </button>
          }
        </div>
      </div>

      <div class="flex flex-col md:flex-row gap-6">
        <!-- Desktop: Sidebar Navigation -->
        <nav class="hidden md:block w-64 flex-shrink-0">
          <ul class="space-y-1">
            @for (section of sortedSections(); track section.id) {
              <li>
                <button
                  (click)="selectSection(section)"
                  [class]="getSectionClass(section)"
                >
                  @if (section.icon) {
                    <span [innerHTML]="sanitizeIcon(section.icon)" class="flex-shrink-0"></span>
                  }
                  <span class="text-sm font-medium">{{ section.label }}</span>
                </button>
              </li>
            }
          </ul>
        </nav>

        <!-- Content Area -->
        <div class="flex-1 bg-white rounded-2xl border border-slate-200 p-4 md:p-6">
          @if (selectedSection()) {
            <div class="mb-4 md:mb-6 pb-4 md:pb-6 border-b border-slate-200">
              <h2 class="text-base md:text-lg font-semibold text-slate-900">{{ selectedSection()!.label }}</h2>
              @if (selectedSection()!.description) {
                <p class="text-xs md:text-sm text-slate-500 mt-1">{{ selectedSection()!.description }}</p>
              }
            </div>
            <ng-container [ngComponentOutlet]="selectedSection()!.component" />
          } @else {
            <div class="text-center py-12 text-slate-500">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mx-auto mb-4 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <p>Select a settings section from the sidebar.</p>
            </div>
          }
        </div>
      </div>
    </div>
  `,
  styles: [`
    .scrollbar-hide {
      -ms-overflow-style: none;
      scrollbar-width: none;
    }
    .scrollbar-hide::-webkit-scrollbar {
      display: none;
    }
  `],
})
export class SettingsComponent implements OnInit {
  private readonly sanitizer = inject(DomSanitizer);
  private readonly route = inject(ActivatedRoute);
  private readonly sections = inject(SETTINGS_SECTIONS);

  protected readonly selectedSection = signal<SettingsSection | null>(null);

  protected readonly sortedSections = () => {
    return [...this.sections].sort((a, b) => (a.order || 0) - (b.order || 0));
  };

  ngOnInit(): void {
    // Check for fragment in URL to auto-select section
    this.route.fragment.subscribe((fragment) => {
      if (fragment) {
        const section = this.sections.find((s) => s.id === fragment);
        if (section) {
          this.selectedSection.set(section);
          return;
        }
      }
      
      // Default to first section if no fragment or section not found
      const sorted = this.sortedSections();
      if (sorted.length > 0 && !this.selectedSection()) {
        this.selectedSection.set(sorted[0]);
      }
    });
  }

  protected sanitizeIcon(icon: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(icon);
  }

  protected selectSection(section: SettingsSection): void {
    this.selectedSection.set(section);
  }

  protected getSectionClass(section: SettingsSection): string {
    const baseClasses = 'flex items-center gap-3 w-full px-3 py-2.5 rounded-xl transition-all text-left';
    const isSelected = this.selectedSection()?.id === section.id;

    if (isSelected) {
      return `${baseClasses} bg-blue-50 text-blue-600`;
    }
    return `${baseClasses} text-slate-600 hover:bg-slate-50`;
  }

  protected getMobileTabClass(section: SettingsSection): string {
    const baseClasses = 'flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all border';
    const isSelected = this.selectedSection()?.id === section.id;

    if (isSelected) {
      return `${baseClasses} bg-blue-50 text-blue-600 border-blue-200`;
    }
    return `${baseClasses} bg-white text-slate-600 border-slate-200 hover:bg-slate-50`;
  }
}
