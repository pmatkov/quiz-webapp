import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { QuizRoutingModule } from './quiz-routing.module';
import { QuizDashboardComponent } from './quiz-dashboard/quiz-dashboard.component';
import { QuizDetailComponent } from './quiz-detail/quiz-detail.component';
import { SharedModule } from '../shared/shared.module';
import { QuizQuestionComponent } from './quiz-question/quiz-question.component';


@NgModule({
  declarations: [
    QuizDashboardComponent,
    QuizDetailComponent,
    QuizQuestionComponent
  ],
  imports: [
    CommonModule,
    QuizRoutingModule,
    SharedModule
  ]
})
export class QuizModule { }
