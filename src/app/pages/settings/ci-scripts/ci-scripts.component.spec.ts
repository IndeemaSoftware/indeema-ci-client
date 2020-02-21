import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CIScriptsComponent } from './ci-scripts.component';

describe('ProjectsComponent', () => {
  let component: CIScriptsComponent;
  let fixture: ComponentFixture<CIScriptsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CIScriptsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CIScriptsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
