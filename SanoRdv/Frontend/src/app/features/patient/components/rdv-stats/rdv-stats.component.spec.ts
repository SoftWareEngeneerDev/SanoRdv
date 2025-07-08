import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RdvStatsComponent } from './rdv-stats.component';

describe('RdvStatsComponent', () => {
  let component: RdvStatsComponent;
  let fixture: ComponentFixture<RdvStatsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RdvStatsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RdvStatsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
