import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FxorderUpdateDialogComponent } from './fxorder-update-dialog.component';

describe('FxorderUpdateDialogComponent', () => {
  let component: FxorderUpdateDialogComponent;
  let fixture: ComponentFixture<FxorderUpdateDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FxorderUpdateDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FxorderUpdateDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
