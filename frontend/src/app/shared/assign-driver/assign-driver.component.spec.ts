import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssignDriverComponent } from './assign-driver.component';

describe('AssignDriverComponent', () => {
  let component: AssignDriverComponent;
  let fixture: ComponentFixture<AssignDriverComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AssignDriverComponent]
    });
    fixture = TestBed.createComponent(AssignDriverComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
