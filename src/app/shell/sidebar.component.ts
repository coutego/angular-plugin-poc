import { Component, ChangeDetectionStrategy, input, computed, signal, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { NavItem, SIDEBAR_FOOTER_ACTIONS, SidebarFooterAction } from '../core/application.plugin';
import { PluginRegistryService } from '../core/plugin-registry.service';

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

      <!-- Footer Actions (contributed by plugins) -->
      @if (enabledFooterActions().length > 0) {
        <div class="px-3 border-t border-slate-100 pt-3 pb-3 bg-white flex-shrink-0">
          @for (action of enabledFooterActions(); track action.id) {
            <a 
              [href]="'#' + (action.route || '')"
              (click)="navigateToAction(action, $event)"
              class="flex items-center gap-3 px-3 py-3 w-full rounded-xl text-slate-500 hover:bg-slate-50 hover:text-blue-600 transition-all"
            >
              @if (action.icon) {
                <span [innerHTML]="sanitizeIcon(action.icon)"></span>
              }
              <span class="text-xs font-semibold">{{ action.label }}</span>
            </a>
          }
        </div>
      }
    </aside>
  `,
})
export class SidebarComponent {
  private readonly router = inject(Router);
  private readonly sanitizer = inject(DomSanitizer);
  private readonly registry = inject(PluginRegistryService);
  private readonly footerActions = inject(SIDEBAR_FOOTER_ACTIONS);

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

  readonly enabledFooterActions = computed(() => {
    return this.footerActions
      .filter(action => {
        const pluginId = (action as any)._pluginId;
        return !pluginId || this.registry.isEnabled(pluginId);
      })
      .sort((a, b) => (a.order || 0) - (b.order || 0));
  });

  readonly currentNode = computed(() => {
    const stack = this.navigationStack();
    const virtualRoot = this.virtualRoot();
    
    return stack.length > 0 ? stack[stack.length - 1] : virtualRoot;
  });

  readonly groupedItems = computed(() => {
    const node = this.currentNode();
    const items = node?.children || [];
    
    // Filter out items from disabled plugins
    const enabledItems = items.filter(item => {
      const pluginId = item._pluginId;
      return !pluginId || this.registry.isEnabled(pluginId);
    });
    
    // Group items by section
    const grouped = new Map<string | undefined, NavItemWithChildren[]>();
    enabledItems.forEach(item => {
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
    
    // Filter children to only include enabled plugins
    const enabledChildren = item.children?.filter(child => {
      const pluginId = child._pluginId;
      return !pluginId || this.registry.isEnabled(pluginId);
    });
    
    if (enabledChildren && enabledChildren.length > 0) {
      // Navigate into submenu with filtered children
      this.navigationStack.update(stack => [...stack, { ...item, children: enabledChildren }]);
    }
    
    // Always navigate to route if available
    if (item.route) {
      this.router.navigate([item.route]);
    }
  }

  navigateToAction(action: SidebarFooterAction, event: Event): void {
    event.preventDefault();
    if (action.route) {
      this.router.navigate([action.route]);
    }
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
