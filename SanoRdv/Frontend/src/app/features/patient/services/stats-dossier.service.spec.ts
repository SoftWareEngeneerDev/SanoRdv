import { TestBed } from '@angular/core/testing';

import { StatsDossierService } from './stats-dossier.service';

describe('StatsDossierService', () => {
  let service: StatsDossierService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(StatsDossierService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
