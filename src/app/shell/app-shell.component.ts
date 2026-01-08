import { Component, ChangeDetectionStrategy, inject, signal, computed } from '@angular/core';
import { Router, RouterOutlet, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs/operators';
import { PROCESSED_NAV_ITEMS, HEADER_COMPONENTS, OVERLAY_COMPONENTS, NavItem } from '../core/application.plugin';
import { PluginRegistryService } from '../core/plugin-registry.service';
import { SidebarComponent } from './sidebar.component';
import { HeaderComponent } from './header.component';
import { BreadcrumbComponent } from './breadcrumb.component';

@Component({
  selector: 'app-shell',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterOutlet, SidebarComponent, HeaderComponent, BreadcrumbComponent],
  template: `
    <div class="min-h-screen bg-slate-50">
      <!-- Header -->
      <app-header 
        [sidebarCollapsed]="sidebarCollapsed()"
        (toggleSidebar)="toggleSidebar()"
        [headerComponents]="headerComponents"
      />

      <!-- Main Layout -->
      <div class="flex pt-16 min-h-screen">
        <!-- Sidebar -->
        <app-sidebar 
          [navItems]="navStructure()"
          [collapsed]="sidebarCollapsed()"
          [currentPath]="currentPath()"
        />

        <!-- Main Content -->
        <main [class]="mainContentClass()">
          <!-- Breadcrumbs -->
          <app-breadcrumb [currentPath]="currentPath()" [navItems]="flatNavItems()" />
          
          <!-- Page Content -->
          <div class="flex-1">
            <router-outlet />
          </div>
        </main>
      </div>

      <!-- Global Overlays -->
      @for (overlay of overlayComponents; track $index) {
        <ng-container [ngComponentOutlet]="overlay" />
      }
    </div>
  `,
})
export class AppShellComponent {
  private readonly router = inject(Router);
  private readonly registry = inject(PluginRegistryService);
  private readonly navItems = inject(PROCESSED_NAV_ITEMS);
  protected readonly headerComponents = inject(HEADER_COMPONENTS);
  protected readonly overlayComponents = inject(OVERLAY_COMPONENTS);

  protected readonly sidebarCollapsed = signal(false);
  protected readonly currentPath = signal('/');

  protected readonly flatNavItems = computed(() => {
    // Filter out nav items from disabled plugins
    return this.navItems.filter(item => {
      const pluginId = item._pluginId;
      return !pluginId || this.registry.isEnabled(pluginId);
    });
  });
  
  protected readonly navStructure = computed(() => {
    const enabledItems = this.flatNavItems();
    const structure = this.buildNavigationTree(enabledItems);
    return structure;
  });

  protected readonly mainContentClass = computed(() => {
    const collapsed = this.sidebarCollapsed();
    return `flex-1 p-6 md:p-8 overflow-x-hidden transition-all duration-300 ${
      collapsed ? 'ml-0' : 'ml-64'
    }`;
  });

  constructor() {
    // Listen to route changes
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.currentPath.set(event.urlAfterRedirects);
      });

    // Set initial path
    this.currentPath.set(this.router.url);
  }

  protected toggleSidebar(): void {
    this.sidebarCollapsed.update(collapsed => !collapsed);
  }

  private buildNavigationTree(items: NavItem[]): NavItem[] {
    // Filter out hidden items
    const visibleItems = items.filter(item => !item.hidden);
    
    // Group by parent
    const byParent = new Map<string | undefined, NavItem[]>();
    visibleItems.forEach(item => {
      const parentId = item.parentId;
      if (!byParent.has(parentId)) {
        byParent.set(parentId, []);
      }
      byParent.get(parentId)!.push(item);
    });

    // Build tree recursively
    const buildNode = (item: NavItem): NavItem & { children?: NavItem[] } => {
      const children = byParent.get(item.id);
      if (children && children.length > 0) {
        return {
          ...item,
          children: children
            .sort((a, b) => (a.order || 0) - (b.order || 0))
            .map(buildNode)
        };
      }
      return { ...item };
    };

    // Get root items (no parent) and build tree
    const roots = byParent.get(undefined) || [];
    
    const result = roots
      .sort((a, b) => (a.order || 0) - (b.order || 0))
      .map(buildNode);
      
    return result;
  }
}
