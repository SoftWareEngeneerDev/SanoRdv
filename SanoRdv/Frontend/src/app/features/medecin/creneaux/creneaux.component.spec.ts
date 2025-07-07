import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreneauxComponent } from './creneaux.component';

describe('CreneauxComponent', () => {
  let component: CreneauxComponent;
  let fixture: ComponentFixture<CreneauxComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CreneauxComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreneauxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
