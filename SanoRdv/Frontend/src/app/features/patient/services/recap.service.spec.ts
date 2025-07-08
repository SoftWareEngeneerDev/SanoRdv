import { TestBed } from '@angular/core/testing';

import { RecapService } from './recap.service';

describe('RecapService', () => {
  let service: RecapService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RecapService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
