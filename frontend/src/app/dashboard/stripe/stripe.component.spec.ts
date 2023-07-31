import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StripeComponent } from './stripe.component';

describe('StripeComponent', () => {
  let component: StripeComponent;
  let fixture: ComponentFixture<StripeComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [StripeComponent]
    });
    fixture = TestBed.createComponent(StripeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
