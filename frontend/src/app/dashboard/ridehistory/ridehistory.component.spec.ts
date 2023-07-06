import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RidehistoryComponent } from './ridehistory.component';

describe('RidehistoryComponent', () => {
  let component: RidehistoryComponent;
  let fixture: ComponentFixture<RidehistoryComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [RidehistoryComponent]
    });
    fixture = TestBed.createComponent(RidehistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
