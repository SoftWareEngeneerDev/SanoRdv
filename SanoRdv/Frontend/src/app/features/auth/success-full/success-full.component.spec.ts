import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SuccessFullComponent } from './success-full.component';

describe('SuccessFullComponent', () => {
  let component: SuccessFullComponent;
  let fixture: ComponentFixture<SuccessFullComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SuccessFullComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SuccessFullComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
