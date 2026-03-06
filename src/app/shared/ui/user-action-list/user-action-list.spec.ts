import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserActionList } from './user-action-list';

describe('UserActionList', () => {
  let component: UserActionList;
  let fixture: ComponentFixture<UserActionList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserActionList],
    }).compileComponents();

    fixture = TestBed.createComponent(UserActionList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
