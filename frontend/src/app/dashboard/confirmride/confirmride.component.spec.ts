import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfirmrideComponent } from './confirmride.component';

describe('ConfirmrideComponent', () => {
  let component: ConfirmrideComponent;
  let fixture: ComponentFixture<ConfirmrideComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ConfirmrideComponent]
    });
    fixture = TestBed.createComponent(ConfirmrideComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
