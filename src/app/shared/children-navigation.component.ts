import { Component, ChangeDetectionStrategy, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { PROCESSED_NAV_ITEMS, NavItem } from '../core/application.plugin';

@Component({
  selector: 'app-children-navigation',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
  template: `
    <div class="max-w-4xl">
      <div class="mb-8">
        <h1 class="text-2xl font-bold text-slate-900 mb-2">{{ parentItem()?.label }}</h1>
        @if (parentItem()?.description) {
          <p class="text-slate-600">{{ parentItem()?.description }}</p>
        }
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        @for (item of childItems(); track item.id) {
          <button
            (click)="navigateTo(item)"
            class="group p-6 bg-white rounded-2xl border border-slate-200 hover:border-slate-300 hover:shadow-lg transition-all duration-200 text-left"
          >
            <div class="flex items-center gap-4 mb-3">
              @if (item.icon) {
                <div [class]="'w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ' + (item.iconColor || 'text-slate-600 bg-slate-100')">
                  <span [innerHTML]="sanitizeIcon(item.icon)"></span>
                </div>
              }
              <h3 class="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                {{ item.label }}
              </h3>
            </div>
            @if (item.description) {
              <p class="text-sm text-slate-500">{{ item.description }}</p>
            }
          </button>
        }
      </div>

      @if (childItems().length === 0) {
        <div class="text-center py-12 text-slate-500">
          <p>No items available.</p>
        </div>
      }
    </div>
  `,
})
export class ChildrenNavigationComponent {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly sanitizer = inject(DomSanitizer);
  private readonly navItems = inject(PROCESSED_NAV_ITEMS);

  protected readonly parentItem = computed(() => {
    const navItemId = this.route.snapshot.data['navItemId'];
    if (navItemId) {
      return this.navItems.find((item) => item.id === navItemId) || null;
    }
    return null;
  });

  protected readonly childItems = computed(() => {
    const parent = this.parentItem();
    if (!parent) {
      return [];
    }

    return this.navItems
      .filter((item) => item.parentId === parent.id)
      .sort((a, b) => (a.order || 0) - (b.order || 0));
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
