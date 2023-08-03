import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InformacionMapaComponent } from './informacion-mapa.component';

describe('InformacionMapaComponent', () => {
  let component: InformacionMapaComponent;
  let fixture: ComponentFixture<InformacionMapaComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InformacionMapaComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InformacionMapaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
