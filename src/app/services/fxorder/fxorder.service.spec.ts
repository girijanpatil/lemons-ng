import { TestBed } from '@angular/core/testing';

import { FxorderService } from './fxorder.service';

describe('FxorderService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: FxorderService = TestBed.get(FxorderService);
    expect(service).toBeTruthy();
  });
});
