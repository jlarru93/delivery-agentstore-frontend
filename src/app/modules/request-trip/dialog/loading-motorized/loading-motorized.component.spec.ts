import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoadingMotorizedComponent } from './loading-motorized.component';

describe('LoadingMotorizedComponent', () => {
  let component: LoadingMotorizedComponent;
  let fixture: ComponentFixture<LoadingMotorizedComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LoadingMotorizedComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LoadingMotorizedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
