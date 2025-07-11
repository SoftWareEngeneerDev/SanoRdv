import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AjouterSpecialitesComponent } from './ajouter-specialites.component';

describe('AjouterSpecialitesComponent', () => {
  let component: AjouterSpecialitesComponent;
  let fixture: ComponentFixture<AjouterSpecialitesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AjouterSpecialitesComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AjouterSpecialitesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
