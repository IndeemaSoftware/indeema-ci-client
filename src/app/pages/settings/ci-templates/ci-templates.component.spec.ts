import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CITemplatesComponent } from './ci-templates.component';

describe('CITemplatesComponent', () => {
  let component: CITemplatesComponent;
  let fixture: ComponentFixture<CITemplatesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CITemplatesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CITemplatesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
