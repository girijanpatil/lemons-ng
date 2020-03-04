import { TestBed } from '@angular/core/testing';

import { SecuritymasterService } from './securitymaster.service';

describe('SecuritymasterService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: SecuritymasterService = TestBed.get(SecuritymasterService);
    expect(service).toBeTruthy();
  });
});
