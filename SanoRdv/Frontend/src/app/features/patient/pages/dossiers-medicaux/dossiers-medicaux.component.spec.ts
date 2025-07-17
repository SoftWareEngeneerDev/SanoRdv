import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DossiersMedicauxComponent } from './dossiers-medicaux.component';

describe('DossiersMedicauxComponent', () => {
  let component: DossiersMedicauxComponent;
  let fixture: ComponentFixture<DossiersMedicauxComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DossiersMedicauxComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DossiersMedicauxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
