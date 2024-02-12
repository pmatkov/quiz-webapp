import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AdminRoutingModule } from './admin-routing.module';
import { AdminDashboardComponent } from './admin-dashboard/admin-dashboard.component';
import { AdminQuizzesComponent } from './admin-quizzes/admin-quizzes.component';
import { AdminUsersComponent } from './admin-users/admin-users.component';
import { AdminQuestionsComponent } from './admin-questions/admin-questions.component';
import { AdminCategoriesComponent } from './admin-categories/admin-categories.component';
import { SharedModule } from '../shared/shared.module';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';

@NgModule({
  declarations: [
    AdminDashboardComponent,
    AdminQuizzesComponent,
    AdminUsersComponent,
    AdminQuestionsComponent,
    AdminCategoriesComponent
  ],
  imports: [
    CommonModule,
    AdminRoutingModule,
    SharedModule,
    MatButtonModule,
    MatTooltipModule
  ]
})
export class AdminModule { }
