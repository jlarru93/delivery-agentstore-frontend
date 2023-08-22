import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrderCourseComponent } from './order-course.component';

describe('OrderCourseComponent', () => {
  let component: OrderCourseComponent;
  let fixture: ComponentFixture<OrderCourseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OrderCourseComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OrderCourseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
