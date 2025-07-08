import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SidebarPatientComponent } from './sidebar-patient.component';

describe('SidebarPatientComponent', () => {
  let component: SidebarPatientComponent;
  let fixture: ComponentFixture<SidebarPatientComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SidebarPatientComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SidebarPatientComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
