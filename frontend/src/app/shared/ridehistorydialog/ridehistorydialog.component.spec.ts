import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RidehistorydialogComponent } from './ridehistorydialog.component';

describe('RidehistorydialogComponent', () => {
  let component: RidehistorydialogComponent;
  let fixture: ComponentFixture<RidehistorydialogComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [RidehistorydialogComponent]
    });
    fixture = TestBed.createComponent(RidehistorydialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
