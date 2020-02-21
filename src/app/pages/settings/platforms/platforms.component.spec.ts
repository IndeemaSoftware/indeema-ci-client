import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PlatformsComponent } from './platforms.component';

describe('ProjectsComponent', () => {
  let component: PlatformsComponent;
  let fixture: ComponentFixture<PlatformsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PlatformsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PlatformsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
