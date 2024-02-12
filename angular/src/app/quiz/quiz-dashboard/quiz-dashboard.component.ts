import { Component, HostListener, OnDestroy, OnInit} from '@angular/core';
import { Observable, Subscription, map } from 'rxjs';
import { Quiz } from '../quiz.model';
import { User } from 'src/app/users/user.model';
import { AuthService } from 'src/app/shared/auth.service';
import { QuizService } from '../quiz.service';
import { QuizCategory } from '../quiz-category.model';
import {environment} from "../../../environments/environment";

@Component({
  selector: 'app-quiz-dashboard',
  templateUrl: './quiz-dashboard.component.html',
  styleUrls: ['./quiz-dashboard.component.css']

})
export class QuizDashboardComponent implements OnInit, OnDestroy {

  hoverIndex : number = -1;
  hoverColor : string = '';
  filterValues : string[] = [];
  query : string = '';

  authenticated : boolean = false;
  description : boolean = false;

  user: User = new User();
  userSubscription : Subscription | null = null;

  quizzes : Quiz[] = [];
  quizzesSubscription : Subscription | null = null;

  quizCategories : QuizCategory[] = [];
  quizCategoriesSubscription : Subscription | null = null;

  authSubscription : Subscription | null = null;

  constructor(private authService: AuthService, private quizService: QuizService) {}

  ngOnInit() {

    this.authSubscription = this.authService.authStatus.subscribe(authenticated => {
      this.authenticated = authenticated;
    });

    this.quizzesSubscription = this.quizService.getQuizzes().subscribe(quizzes => {
      this.quizzes = quizzes;
    });

    this.quizCategoriesSubscription = this.quizService.getQuizCategories().subscribe(quizCategories => {
      this.quizCategories = quizCategories; 
    });

  }

  getQuestionsCount(id: string): Observable<number> {
    return this.quizService.assignedQuestionsSubject.pipe(
      map(questions => (questions ? questions.filter(question => question.quizId === id).length : 0))
    );
  }

  getCategoryColor(id: string): Observable<string> {
    return this.quizService.getQuizCategory(id)
      .pipe(
        map(category => category?.color ? category.color : "silver")
      )
  }

  getCategoryImage(id: string): Observable<string> {
    return this.quizService.getQuizCategory(id)
      .pipe(
        map(category => {
          const path : string = environment.API_URL + '/assets/img/';
          return category?.image ? path + category.image : "";
        })
      )
  }


  setStyle(category: QuizCategory, index: number): void {
    
    if (category.color) {
      this.hoverColor = category.color;
      this.hoverIndex = index;
    }
  }
  
  resetStyle(category: QuizCategory): void {

    if (!category.selected) {
      this.hoverColor = '';
      this.hoverIndex = -1;
    }
  }

  setFilterValues(category : QuizCategory) {
    
    const i = this.filterValues.indexOf(category.id);

    if (i == -1) {
      category.selected = true;
      this.filterValues.push(category.id);
    }
    else {
      category.selected = false;
      this.filterValues.splice(i, 1);
    }
    
    this.filterValues = [...this.filterValues];
  }

  showDescription(quiz: Quiz) {
    if (!quiz.showOverlay) {

      quiz.showDescription = true;

      setTimeout(() => {
        quiz.showDescription = false;
      }, 5000);
    
    }
  }

  hideDescription(quiz: Quiz) {

    if (quiz.showDescription) {
      quiz.showDescription = false;
    }
  }

  toggleOverlay(quiz: Quiz) {
    if (!this.authenticated) {
      quiz.showOverlay = !quiz.showOverlay;
    }
    quiz.showDescription = false;
  }

  @HostListener('mouseleave', ['$event'])
  hideOverlay(event: MouseEvent) {
    this.quizzes.forEach(quiz => {
      if (quiz.showOverlay) {
        quiz.showOverlay = false;
      }
    });
  }

  ngOnDestroy() {

    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
    if (this.quizzesSubscription) {
      this.quizzesSubscription.unsubscribe();
    }
    if (this.quizCategoriesSubscription) {
      this.quizCategoriesSubscription.unsubscribe();
    }

    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }

  }

}
