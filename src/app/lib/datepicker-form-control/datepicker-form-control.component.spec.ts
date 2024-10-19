import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DatepickerFormControlComponent } from './datepicker-form-control.component';

describe('DatepickerFormControlComponent', () => {
  let component: DatepickerFormControlComponent;
  let fixture: ComponentFixture<DatepickerFormControlComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DatepickerFormControlComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DatepickerFormControlComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
