import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LeaderboardRoutingModule } from './leaderboard-routing.module';
import { LeaderboardComponent } from './leaderboard/leaderboard.component';
import { SharedModule } from '../shared/shared.module';


@NgModule({
  declarations: [
    LeaderboardComponent
  ],
  imports: [
    CommonModule,
    LeaderboardRoutingModule,
    SharedModule
  ]
})
export class LeaderboardModule { }
