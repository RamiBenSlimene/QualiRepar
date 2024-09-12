import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AgStepperComponent } from './ag-stepper.component';

describe('AgStepperComponent', () => {
  let component: AgStepperComponent;
  let fixture: ComponentFixture<AgStepperComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AgStepperComponent]
    });
    fixture = TestBed.createComponent(AgStepperComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
