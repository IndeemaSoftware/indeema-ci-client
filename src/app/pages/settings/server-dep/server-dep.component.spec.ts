import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ServerDepComponent } from './server-dep.component';

describe('ProjectsComponent', () => {
  let component: ServerDepComponent;
  let fixture: ComponentFixture<ServerDepComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ServerDepComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ServerDepComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
