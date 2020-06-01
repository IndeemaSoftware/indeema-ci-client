import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomSetupComponent } from './custom-setup.component';

describe('CustomSetupComponent', () => {
  let component: CustomSetupComponent;
  let fixture: ComponentFixture<CustomSetupComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CustomSetupComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CustomSetupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
