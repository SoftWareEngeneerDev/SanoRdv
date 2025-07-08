import { TestBed } from '@angular/core/testing';

import { RechercheMedecinService } from './recherche-medecin.service';

describe('RechercheMedecinService', () => {
  let service: RechercheMedecinService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RechercheMedecinService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
