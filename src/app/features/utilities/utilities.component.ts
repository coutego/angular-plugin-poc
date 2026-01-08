import { Component, ChangeDetectionStrategy, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { PROCESSED_NAV_ITEMS, NavItem } from '../../core/application.plugin';

@Component({
  selector: 'app-utilities',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
  template: `
    <div class="max-w-4xl">
      <div class="mb-8">
        <h1 class="text-2xl font-bold text-slate-900 mb-2">Utilities</h1>
        <p class="text-slate-600">A collection of helpful tools and utilities.</p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        @for (item of childItems(); track item.id) {
          <button
            (click)="navigateTo(item)"
            class="group p-6 bg-white rounded-2xl border border-slate-200 hover:border-slate-300 hover:shadow-lg transition-all duration-200 text-left"
          >
            <div class="flex flex-col gap-4">
              @if (item.icon) {
                <div [class]="'w-12 h-12 rounded-xl flex items-center justify-center ' + (item.iconColor || 'text-slate-600 bg-slate-100')">
                  <span [innerHTML]="sanitizeIcon(item.icon)"></span>
                </div>
              }
              <div>
                <h3 class="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                  {{ item.label }}
                </h3>
                @if (item.description) {
                  <p class="text-sm text-slate-500 mt-1">{{ item.description }}</p>
                }
              </div>
            </div>
          </button>
        }
      </div>

      @if (childItems().length === 0) {
        <div class="text-center py-12 text-slate-500">
          <p>No utilities available yet.</p>
        </div>
      }
    </div>
  `,
})
export class UtilitiesComponent {
  private readonly router = inject(Router);
  private readonly sanitizer = inject(DomSanitizer);
  private readonly navItems = inject(PROCESSED_NAV_ITEMS);

  protected readonly childItems = computed(() => {
    const items = this.navItems;
    const children = items
      .filter((item) => item.parentId === 'utilities.main')
      .sort((a, b) => (a.order || 0) - (b.order || 0));
    return children;
  });

  protected sanitizeIcon(icon: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(icon);
  }

  protected navigateTo(item: NavItem): void {
    if (item.route) {
      this.router.navigate([item.route]);
    }
  }
}
