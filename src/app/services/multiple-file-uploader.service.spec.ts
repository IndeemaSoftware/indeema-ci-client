import { TestBed } from '@angular/core/testing';

import { MultipleFileUploaderService } from './multiple-file-uploader.service';

describe('MultipleFileUploaderService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: MultipleFileUploaderService = TestBed.get(MultipleFileUploaderService);
    expect(service).toBeTruthy();
  });
});
