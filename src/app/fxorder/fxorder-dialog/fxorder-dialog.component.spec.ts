import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FxorderDialogComponent } from './fxorder-dialog.component';

describe('FxorderDialogComponent', () => {
  let component: FxorderDialogComponent;
  let fixture: ComponentFixture<FxorderDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FxorderDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FxorderDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
