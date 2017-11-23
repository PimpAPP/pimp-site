import { TestBed, inject } from '@angular/core/testing';

import { CatadorDataService } from './catador-data.service';

describe('CatadorDataService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CatadorDataService]
    });
  });

  it('should be created', inject([CatadorDataService], (service: CatadorDataService) => {
    expect(service).toBeTruthy();
  }));
});
