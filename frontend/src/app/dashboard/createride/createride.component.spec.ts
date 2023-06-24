import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreaterideComponent } from './createride.component';

describe('CreaterideComponent', () => {
  let component: CreaterideComponent;
  let fixture: ComponentFixture<CreaterideComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CreaterideComponent]
    });
    fixture = TestBed.createComponent(CreaterideComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
