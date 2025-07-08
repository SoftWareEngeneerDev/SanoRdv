import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NotificationsStatsComponent } from './notifications-stats.component';

describe('NotificationsStatsComponent', () => {
  let component: NotificationsStatsComponent;
  let fixture: ComponentFixture<NotificationsStatsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NotificationsStatsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NotificationsStatsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
