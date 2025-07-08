import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MotifComponent } from './motif.component';

describe('MotifComponent', () => {
  let component: MotifComponent;
  let fixture: ComponentFixture<MotifComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MotifComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MotifComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
