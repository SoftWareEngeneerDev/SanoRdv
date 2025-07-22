import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MedecinDetailComponent } from './medecin-detail.component';

describe('MedecinDetailComponent', () => {
  let component: MedecinDetailComponent;
  let fixture: ComponentFixture<MedecinDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MedecinDetailComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MedecinDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
