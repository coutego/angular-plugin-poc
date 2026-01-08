import { Component, ChangeDetectionStrategy } from '@angular/core';
import { ChildrenNavigationComponent } from '../../shared/children-navigation.component';

/**
 * @deprecated This component is no longer used.
 * The utilities page now uses ChildrenNavigationComponent automatically.
 * This file is kept for reference but can be safely deleted.
 */
@Component({
  selector: 'app-utilities',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ChildrenNavigationComponent],
  template: `<app-children-navigation />`,
})
export class UtilitiesComponent {}
