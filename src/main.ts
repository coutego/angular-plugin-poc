import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter, withHashLocation } from '@angular/router';
import { AppComponent } from './app/app.component';
import { plugins } from './app/plugins';

bootstrapApplication(AppComponent, {
  providers: [provideRouter([], withHashLocation()), ...plugins],
}).catch((err) => console.error(err));
