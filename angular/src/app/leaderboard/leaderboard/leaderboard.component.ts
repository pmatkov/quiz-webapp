import { Component } from '@angular/core';
import { Subscription, forkJoin, skipWhile, take } from 'rxjs';
import { QuizResults } from 'src/app/quiz/quiz-results.model';
import { QuizService } from 'src/app/quiz/quiz.service';
import { AuthService } from 'src/app/shared/auth.service';
import { UserService } from 'src/app/shared/user.service';
import { User } from 'src/app/users/user.model';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-leaderboard',
  templateUrl: './leaderboard.component.html',
  styleUrls: ['./leaderboard.component.css']
})
export class LeaderboardComponent {

  users: User[] = [];
  usersSubscription : Subscription | null = null;

  quizResults : QuizResults[] = [];
  quizResultsSubscription : Subscription | null = null;

  imgDir : string = environment.API_URL + '/assets/uploads/';
  defaultImg : string = environment.API_URL + '/assets/img/' + 'avatar.png';

  sortCol: string = '';
  sortUp: boolean = true;

  constructor(private userService: UserService, private quizService: QuizService){}

  ngOnInit(): void {

    forkJoin({
      usersResponse: this.userService.getUsers().pipe(skipWhile(users => users.length === 0), take(1)),
      quizResultsResponse: this.quizService.getQuizResults().pipe(skipWhile(quizResults => quizResults.length === 0), take(1))
    }).subscribe({
      next: ({ usersResponse, quizResultsResponse }) => {
        
        this.users = usersResponse;
        this.quizResults = quizResultsResponse;
    
        this.users.forEach(user => {
          const userQuizResults = this.quizResults.filter(result => result.userId === user.id);
          let totalQuizzes = 0;
          let totalScore = 0;
          let totalQuestions = 0;
    
          userQuizResults.forEach(result => {
            totalQuizzes++;
            totalScore += result.score;
            totalQuestions += result.totalQuestions;
          });
    
          const averageScore = totalQuizzes > 0 ? (totalScore / totalQuestions) * 100 : 0;
    
          user.quizzes = totalQuizzes;
          user.questions = totalQuestions;
          user.score = totalScore;
          user.averageScore = parseFloat((averageScore).toFixed(2));
        });

        this.users = this.users.filter(user => user.quizzes);
      },
      error: (error) => {
        console.error(error);
      }
    });

  }

  toggleSortDirection() {
    this.sortUp = !this.sortUp;
  }

  setSortColumn(columnName: string) {
    this.sortCol = columnName;
    this.sortUp = !this.sortUp;
    
  }

  isSelected(col: string) {

    return col == this.sortCol;
  }

  ngOnDestroy() {

    if (this.usersSubscription) {
      this.usersSubscription.unsubscribe();
    }

    if (this.quizResultsSubscription) {
      this.quizResultsSubscription.unsubscribe();
    }
 
  }

}
