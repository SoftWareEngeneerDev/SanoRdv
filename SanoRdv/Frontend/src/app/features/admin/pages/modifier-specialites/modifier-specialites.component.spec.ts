import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModifierSpecialitesComponent } from './modifier-specialites.component';

describe('ModifierSpecialitesComponent', () => {
  let component: ModifierSpecialitesComponent;
  let fixture: ComponentFixture<ModifierSpecialitesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ModifierSpecialitesComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModifierSpecialitesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
