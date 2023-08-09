import { TestBed } from '@angular/core/testing';

import { RequestTripService } from './request-trip.service';

describe('RequestTripService', () => {
  let service: RequestTripService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RequestTripService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
