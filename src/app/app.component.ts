import { Component, ChangeDetectionStrategy, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ROOT_COMPONENT } from './core/application.plugin';
import { AppShellComponent } from './shell/app-shell.component';

@Component({
  selector: 'app-root',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, AppShellComponent],
  template: `
    @if (rootComponent(); as component) {
      <ng-container [ngComponentOutlet]="component" />
    } @else {
      <app-shell />
    }
  `,
})
export class AppComponent {
  private readonly rootComponents = inject(ROOT_COMPONENT);

  protected readonly rootComponent = computed(() => {
    const components = this.rootComponents;
    return components.length > 0 ? components[components.length - 1] : null;
  });
}
