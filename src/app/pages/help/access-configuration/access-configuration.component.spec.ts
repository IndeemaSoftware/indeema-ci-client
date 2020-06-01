import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AccessConfigurationComponent } from './access-configuration.component';

describe('AccessConfigurationComponent', () => {
  let component: AccessConfigurationComponent;
  let fixture: ComponentFixture<AccessConfigurationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AccessConfigurationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AccessConfigurationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
