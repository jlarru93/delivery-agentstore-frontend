import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MultiAssigmentComponent } from './multiAssigment.component';

describe('InvoicetComponent', () => {
  let component: MultiAssigmentComponent;
  let fixture: ComponentFixture<MultiAssigmentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MultiAssigmentComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MultiAssigmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
