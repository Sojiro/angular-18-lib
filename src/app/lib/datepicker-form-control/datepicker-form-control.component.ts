import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  ElementRef,
  inject,
  Injectable,
  model,
  OnDestroy,
  signal,
  viewChild,
  viewChildren,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import {
  DateAdapter,
  MAT_DATE_FORMATS,
  MAT_DATE_LOCALE,
  provideNativeDateAdapter,
} from '@angular/material/core';
import { MatCalendar, MatCalendarBody } from '@angular/material/datepicker';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { BehaviorSubject, startWith, Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-datepicker-form-control',
  standalone: true,
  imports: [
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatCalendar,
    MatCardModule,
  ],
  providers: [
    provideNativeDateAdapter(),
    { provide: MAT_DATE_LOCALE, useValue: 'en-NL' },
  ],
  templateUrl: './datepicker-form-control.component.html',
  styleUrl: './datepicker-form-control.component.css',
})
export class DatepickerFormControlComponent {
  readonly exampleHeader = ExampleHeader;

  #dateAdapter = inject<DateAdapter<Date>>(DateAdapter);
  #dateFormats = inject(MAT_DATE_FORMATS);
  #service = inject(DatePickerService);

  selected = model<Date | null>(null);
  showCalendar = signal(false);

  weekRows = viewChildren(MatCalendarBody, {
    read: ElementRef,
  });
  weeks = viewChild(MatCalendar, { read: ElementRef });

  displayDate = computed<string>(() => {
    const selected = this.selected();
    if (selected) {
      return this.#dateAdapter.format(
        selected,
        this.#dateFormats.display.dateInput
      );
    }
    return '';
  });

  loadWeeks() {}

  toggleCalendar() {
    this.showCalendar.update((f) => !f);
    this.#service.calculateWeeks();
  }

  constructor() {
    effect(() => console.log('selected', this.selected()));
  }
}

/** Custom header component for datepicker. */
@Component({
  selector: 'example-header',
  styles: `
    .example-header {
      display: flex;
      align-items: center;
      padding: 0.5em;
    }

    .example-header-label {
      flex: 1;
      height: 1em;
      font-weight: 500;
      text-align: center;
    }
    .weeks {
    position: absolute;
    bottom: 0;
    left: -3rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    padding: 1rem;
    background: lightgray;
    border-radius: 12px 0 0 12px;
    box-shadow: var(--mdc-elevated-card-container-elevation, var(--mat-app-level1));
      span {
        background: inherit;
        padding: .25rem;
      }
    }
  `,
  template: `
    <div class="example-header">
      <button mat-icon-button (click)="previousClicked('year')">
        <mat-icon>keyboard_double_arrow_left</mat-icon>
      </button>
      <button mat-icon-button (click)="previousClicked('month')">
        <mat-icon>keyboard_arrow_left</mat-icon>
      </button>
      <span class="example-header-label">{{ periodLabel() }}</span>
      <button mat-icon-button (click)="nextClicked('month')">
        <mat-icon>keyboard_arrow_right</mat-icon>
      </button>
      <button mat-icon-button (click)="nextClicked('year')">
        <mat-icon>keyboard_double_arrow_right</mat-icon>
      </button>
      <div class="weeks">
        @for(row of [].constructor(weeksRows()); track $index) {

        <span>{{ $index }}</span>
        }
      </div>
    </div>
  `,
  standalone: true,
  imports: [MatButtonModule, MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class ExampleHeader<Date> implements OnDestroy {
  private _calendar = inject<MatCalendar<Date>>(MatCalendar);
  private _dateAdapter = inject<DateAdapter<Date>>(DateAdapter);
  private _dateFormats = inject(MAT_DATE_FORMATS);
  #service = inject(DatePickerService);

  private _destroyed = new Subject<void>();

  readonly periodLabel = signal('');

  weeksRows = toSignal(this.#service.rows$);

  constructor() {
    this._calendar.stateChanges
      .pipe(startWith(null), takeUntil(this._destroyed))
      .subscribe(() => {
        this.periodLabel.set(
          this._dateAdapter
            .format(
              this._calendar.activeDate,
              this._dateFormats.display.monthYearLabel
            )
            .toLocaleUpperCase()
        );
      });
  }

  ngOnDestroy() {
    this._destroyed.next();
    this._destroyed.complete();
  }

  previousClicked(mode: 'month' | 'year') {
    this._calendar.activeDate =
      mode === 'month'
        ? this._dateAdapter.addCalendarMonths(this._calendar.activeDate, -1)
        : this._dateAdapter.addCalendarYears(this._calendar.activeDate, -1);
    this.#service.calculateWeeks();
  }

  nextClicked(mode: 'month' | 'year') {
    this._calendar.activeDate =
      mode === 'month'
        ? this._dateAdapter.addCalendarMonths(this._calendar.activeDate, 1)
        : this._dateAdapter.addCalendarYears(this._calendar.activeDate, 1);
    this.#service.calculateWeeks();
  }
}

@Injectable({ providedIn: 'root' })
class DatePickerService {
  weekRows = new BehaviorSubject<number>(0);

  rows$ = this.weekRows.asObservable();

  calculateWeeks() {
    setTimeout(
      () => this.weekRows.next(document.querySelectorAll('[role=row]').length),
      1
    );
  }
}
