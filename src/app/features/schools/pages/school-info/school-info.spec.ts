import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SchoolInfo } from './school-info';

describe('SchoolInfo', () => {
  let component: SchoolInfo;
  let fixture: ComponentFixture<SchoolInfo>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SchoolInfo],
    }).compileComponents();

    fixture = TestBed.createComponent(SchoolInfo);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
