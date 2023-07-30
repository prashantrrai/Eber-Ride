import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TripEndComponent } from './trip-end.component';

describe('TripEndComponent', () => {
  let component: TripEndComponent;
  let fixture: ComponentFixture<TripEndComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TripEndComponent]
    });
    fixture = TestBed.createComponent(TripEndComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
