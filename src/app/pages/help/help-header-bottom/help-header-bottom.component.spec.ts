import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HelpHeaderBottomComponent } from './help-header-bottom.component';

describe('HelpHeaderBottomComponent', () => {
  let component: HelpHeaderBottomComponent;
  let fixture: ComponentFixture<HelpHeaderBottomComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HelpHeaderBottomComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HelpHeaderBottomComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
