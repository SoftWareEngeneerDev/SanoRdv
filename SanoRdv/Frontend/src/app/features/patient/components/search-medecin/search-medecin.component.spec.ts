import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RechercheMedecinComponent } from './search-medecin.component';

describe('SearchMedecinComponent', () => {
  let component: RechercheMedecinComponent;
  let fixture: ComponentFixture<RechercheMedecinComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RechercheMedecinComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RechercheMedecinComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
