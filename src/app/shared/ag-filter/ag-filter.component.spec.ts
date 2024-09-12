import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AgFilterComponent } from './ag-filter.component';

describe('AgFilterComponent', () => {
  let component: AgFilterComponent;
  let fixture: ComponentFixture<AgFilterComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AgFilterComponent]
    });
    fixture = TestBed.createComponent(AgFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
