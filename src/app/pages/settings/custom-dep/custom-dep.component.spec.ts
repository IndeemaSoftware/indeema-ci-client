import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomDepComponent } from './custom-dep.component';

describe('ProjectsComponent', () => {
  let component: CustomDepComponent;
  let fixture: ComponentFixture<CustomDepComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CustomDepComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CustomDepComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
