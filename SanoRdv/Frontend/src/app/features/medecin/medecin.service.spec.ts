import { TestBed } from '@angular/core/testing';

import { MedecinService } from './Medecin.service';

describe('MedecinService', () => {
  let service: MedecinService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MedecinService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
