import { TestBed } from '@angular/core/testing';

import { CreaterideService } from './createride.service';

describe('CreaterideService', () => {
  let service: CreaterideService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CreaterideService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
