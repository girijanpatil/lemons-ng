import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FxorderComponent } from './fxorder.component';

describe('FxorderComponent', () => {
  let component: FxorderComponent;
  let fixture: ComponentFixture<FxorderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FxorderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FxorderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
