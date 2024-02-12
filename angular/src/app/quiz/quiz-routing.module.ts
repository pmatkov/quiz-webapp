import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { QuizDashboardComponent } from './quiz-dashboard/quiz-dashboard.component';
import { QuizDetailComponent } from './quiz-detail/quiz-detail.component';
import { AuthGuard } from '../auth.guard';

const routes: Routes = [
  {path: '', component: QuizDashboardComponent},
  {path: ':quizid', component: QuizDetailComponent, canActivate:[AuthGuard]}
];


@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class QuizRoutingModule { }
