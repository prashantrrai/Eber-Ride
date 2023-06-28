import { TestBed } from '@angular/core/testing';

import { ConfirmrideService } from './confirmride.service';

describe('ConfirmrideService', () => {
  let service: ConfirmrideService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ConfirmrideService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
