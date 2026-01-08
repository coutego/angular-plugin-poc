import { Component, ChangeDetectionStrategy, input, computed, signal, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { NavItem } from '../core/application.plugin';

interface NavItemWithChildren extends NavItem {
  children?: NavItemWithChildren[];
}

@Component({
  selector: 'app-sidebar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
  template: `
    <aside [class]="sidebarClass()">
      <!-- Section Header (when in submenu) -->
      @if (currentNode() && currentNode()!.id !== 'root') {
        <div class="border-b border-slate-200/80 flex-shrink-0">
          <!-- Back button -->
          <div class="px-3 pt-3 pb-2">
            <button 
              class="flex items-center gap-2 text-xs text-slate-400 hover:text-blue-600 transition-colors group"
              (click)="navigateBack()"
            >
              <div class="p-1 rounded-md group-hover:bg-slate-100 transition-all">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </div>
              <span class="font-medium">Back</span>
            </button>
          </div>
          
          <!-- Current section header -->
          <div class="px-3 pb-3 flex items-center gap-3">
            @if (currentNode()!.icon) {
              <div [class]="'p-2 rounded-lg ' + (currentNode()!.iconColor || 'text-slate-600 bg-slate-100')">
                <span [innerHTML]="sanitizeIcon(currentNode()!.icon!)"></span>
              </div>
            }
            <span class="font-bold text-slate-800 text-sm truncate">{{ currentNode()!.label }}</span>
          </div>
        </div>
      }

      <!-- Navigation List -->
      <nav class="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        @for (group of groupedItems(); track $index) {
          <div>
            @if (group.section) {
              <div class="pt-4 pb-2 px-3">
                <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{{ group.section }}</span>
              </div>
            }
            
            @for (item of group.items; track item.id) {
              <a 
                [href]="'#/' + (item.route || '')"
                (click)="navigateToItem(item, $event)"
                [class]="getItemClass(item)"
              >
                @if (item.icon) {
                  <span class="flex-shrink-0" [innerHTML]="sanitizeIcon(item.icon)"></span>
                }
                <span class="text-sm font-medium flex-1 truncate">{{ item.label }}</span>
                @if (item.children && item.children.length > 0) {
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 ml-auto opacity-50 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                  </svg>
                }
              </a>
            }
          </div>
        }
      </nav>

      <!-- Footer - Settings Button -->
      <div class="px-3 border-t border-slate-100 pt-3 pb-3 bg-white flex-shrink-0">
        <a 
          href="#/settings"
          (click)="navigateToSettings($event)"
          class="flex items-center gap-3 px-3 py-3 w-full rounded-xl text-slate-500 hover:bg-slate-50 hover:text-blue-600 transition-all"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span class="text-xs font-semibold">Settings</span>
        </a>
      </div>
    </aside>
  `,
})
export class SidebarComponent {
  private readonly router = inject(Router);
  private readonly sanitizer = inject(DomSanitizer);

  readonly navItems = input<NavItemWithChildren[]>([]);
  readonly collapsed = input<boolean>(false);
  readonly currentPath = input<string>('/');

  private readonly navigationStack = signal<NavItemWithChildren[]>([]);

  readonly sidebarClass = computed(() => {
    const collapsed = this.collapsed();
    return `bg-white border-r border-slate-200 fixed top-16 h-[calc(100vh-4rem)] z-30 flex flex-col overflow-hidden transition-all duration-300 ${
      collapsed ? 'w-0 -ml-64' : 'w-64'
    }`;
  });

  readonly currentNode = computed(() => {
    const stack = this.navigationStack();
    const virtualRoot = this.virtualRoot();
    
    return stack.length > 0 ? stack[stack.length - 1] : virtualRoot;
  });

  readonly groupedItems = computed(() => {
    const node = this.currentNode();
    const items = node?.children || [];
    
    // Group items by section
    const grouped = new Map<string | undefined, NavItemWithChildren[]>();
    items.forEach(item => {
      const section = item.section;
      if (!grouped.has(section)) {
        grouped.set(section, []);
      }
      grouped.get(section)!.push(item);
    });

    // Convert to array format
    const result: { section?: string; items: NavItemWithChildren[] }[] = [];
    
    // Items without section first
    if (grouped.has(undefined)) {
      result.push({ items: grouped.get(undefined)! });
    }
    
    // Then items with sections
    Array.from(grouped.keys())
      .filter(key => key !== undefined)
      .forEach(section => {
        result.push({ section: section!, items: grouped.get(section)! });
      });

    return result;
  });

  private readonly virtualRoot = computed((): NavItemWithChildren => {
    const items = this.navItems();
    const root = {
      id: 'root',
      label: 'Menu',
      children: items
    };
    return root;
  });

  constructor() {
    // Use effect to initialize navigation stack when nav items become available
    effect(() => {
      const virtualRoot = this.virtualRoot();
      const currentStack = this.navigationStack();
      
      // Initialize stack if empty and we have nav items
      if (currentStack.length === 0 && virtualRoot.children && virtualRoot.children.length > 0) {
        this.navigationStack.set([virtualRoot]);
      }
    });
  }

  protected sanitizeIcon(icon: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(icon);
  }

  navigateToItem(item: NavItemWithChildren, event: Event): void {
    event.preventDefault();
    
    if (item.children && item.children.length > 0) {
      // Navigate into submenu
      this.navigationStack.update(stack => [...stack, item]);
    }
    
    // Always navigate to route if available
    if (item.route) {
      this.router.navigate([item.route]);
    }
  }

  navigateToSettings(event: Event): void {
    event.preventDefault();
    this.router.navigate(['/settings']);
  }

  navigateBack(): void {
    this.navigationStack.update(stack => {
      if (stack.length > 1) {
        return stack.slice(0, -1);
      }
      return stack;
    });
  }

  getItemClass(item: NavItemWithChildren): string {
    const baseClasses = 'flex items-center gap-3 px-3 py-2.5 rounded-xl group transition-all cursor-pointer mb-1';
    const isActive = this.isItemActive(item);
    
    if (isActive) {
      return `${baseClasses} bg-blue-50 text-blue-600 shadow-sm ring-1 ring-blue-100`;
    } else {
      return `${baseClasses} text-slate-600 hover:bg-slate-50`;
    }
  }

  private isItemActive(item: NavItemWithChildren): boolean {
    const currentPath = this.currentPath();
    const itemRoute = '/' + (item.route || '');
    return currentPath === itemRoute || currentPath.startsWith(itemRoute + '/');
  }
}
