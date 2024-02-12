import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminQuizzesComponent } from './admin-quizzes.component';

describe('AdminQuizzesComponent', () => {
  let component: AdminQuizzesComponent;
  let fixture: ComponentFixture<AdminQuizzesComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AdminQuizzesComponent]
    });
    fixture = TestBed.createComponent(AdminQuizzesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
