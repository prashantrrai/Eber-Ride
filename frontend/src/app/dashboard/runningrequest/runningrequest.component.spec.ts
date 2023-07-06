import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RunningrequestComponent } from './runningrequest.component';

describe('RunningrequestComponent', () => {
  let component: RunningrequestComponent;
  let fixture: ComponentFixture<RunningrequestComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [RunningrequestComponent]
    });
    fixture = TestBed.createComponent(RunningrequestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
