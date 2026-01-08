import { Component, ChangeDetectionStrategy, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ROOT_COMPONENT, SHELL_COMPONENT } from './core/application.plugin';
import { AppShellComponent } from './shell/app-shell.component';

@Component({
  selector: 'app-root',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, AppShellComponent],
  template: `
    @if (rootComponent(); as component) {
      <ng-container [ngComponentOutlet]="component" />
    } @else if (shellComponent(); as shell) {
      <ng-container [ngComponentOutlet]="shell" />
    } @else {
      <app-shell />
    }
  `,
})
export class AppComponent {
  private readonly rootComponents = inject(ROOT_COMPONENT);
  private readonly shellComponents = inject(SHELL_COMPONENT);

  protected readonly rootComponent = computed(() => {
    const components = this.rootComponents;
    return components.length > 0 ? components[components.length - 1] : null;
  });

  protected readonly shellComponent = computed(() => {
    const components = this.shellComponents;
    return components.length > 0 ? components[components.length - 1] : null;
  });
}
