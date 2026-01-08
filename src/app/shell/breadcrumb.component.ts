import { Component, ChangeDetectionStrategy, input, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { NavItem } from '../core/application.plugin';

interface BreadcrumbItem {
  label: string;
  path: string;
}

@Component({
  selector: 'app-breadcrumb',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
  template: `
    @if (breadcrumbItems().length > 0) {
      <nav class="flex text-xs text-slate-400 font-medium mb-4" aria-label="Breadcrumb">
        <ol class="inline-flex items-center">
          @for (item of breadcrumbItems(); track $index; let isLast = $last) {
            <li class="inline-flex items-center">
              @if ($index > 0) {
                <span class="mx-2 text-slate-300">/</span>
              }
              @if (isLast) {
                <span class="text-slate-700 font-semibold">{{ item.label }}</span>
              } @else {
                <a 
                  [href]="'#' + item.path"
                  (click)="navigateTo(item.path, $event)"
                  class="hover:text-blue-600 transition-colors"
                >
                  {{ item.label }}
                </a>
              }
            </li>
          }
        </ol>
      </nav>
    }
  `,
})
export class BreadcrumbComponent {
  private readonly router = inject(Router);

  readonly currentPath = input<string>('/');
  readonly navItems = input<NavItem[]>([]);

  readonly breadcrumbItems = computed((): BreadcrumbItem[] => {
    const path = this.currentPath();
    const items = this.navItems();
    
    // Find the current nav item
    const currentItem = items.find(item => item.route === path);
    if (!currentItem) {
      return [];
    }

    // Build breadcrumb trail
    const trail: BreadcrumbItem[] = [];
    
    // Add parent items
    let parentId = currentItem.parentId;
    while (parentId) {
      const parent = items.find(item => item.id === parentId);
      if (parent) {
        trail.unshift({
          label: parent.label,
          path: parent.route || '/'
        });
        parentId = parent.parentId;
      } else {
        break;
      }
    }

    // Add current item
    trail.push({
      label: currentItem.label,
      path: currentItem.route || '/'
    });

    return trail;
  });

  navigateTo(path: string, event: Event): void {
    event.preventDefault();
    this.router.navigate([path]);
  }
}
