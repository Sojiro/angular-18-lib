import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { DatepickerFormControlComponent } from './lib/datepicker-form-control/datepicker-form-control.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, DatepickerFormControlComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  title = 'angular-18-lib';
}
