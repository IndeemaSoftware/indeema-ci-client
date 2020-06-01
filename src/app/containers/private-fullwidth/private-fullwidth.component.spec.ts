import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PrivateFullwidthComponent } from './private-fullwidth.component';

describe('PrivateFullwidthComponent', () => {
  let component: PrivateFullwidthComponent;
  let fixture: ComponentFixture<PrivateFullwidthComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PrivateFullwidthComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PrivateFullwidthComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
