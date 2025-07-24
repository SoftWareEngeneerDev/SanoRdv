import { TestBed } from '@angular/core/testing';

import { DetailMedecinService } from './detail-medecin.service';

describe('DetailMedecinService', () => {
  let service: DetailMedecinService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DetailMedecinService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
