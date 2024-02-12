import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { QuizService } from '../quiz.service';
import { Quiz } from '../quiz.model';
import {  Subscription, combineLatest, mergeMap } from 'rxjs';
import { Question } from '../question.model';
import { User } from 'src/app/users/user.model';
import { AuthService } from 'src/app/shared/auth.service';
import { QuizResults } from '../quiz-results.model';

@Component({
  selector: 'app-quiz-detail',
  templateUrl: './quiz-detail.component.html',
  styleUrls: ['./quiz-detail.component.css']
})
export class QuizDetailComponent implements OnInit, OnDestroy {

  id: string = '';

  quiz: Quiz = new Quiz();
  quizSubscription: Subscription | null = null;

  quizQuestions : Question[] = [];
  questionsSubscription: Subscription | null = null;

  user: User = new User();
  userSubscription : Subscription | null = null;

  timeLeft: number = 0; 
  finalTime: number = 0;
  timer: any;

  questionIndex : number = 0;
  question : Question = new Question();
  quizResults: QuizResults = new QuizResults();
  quizCompleted : boolean = false;

  constructor(private activatedRoute: ActivatedRoute, private quizService: QuizService, private authService: AuthService) {}

  ngOnInit() {

    this.activatedRoute.params.subscribe((data) => {
      this.id = data['quizid'];
    });

    this.quizSubscription = this.quizService.getQuiz(this.id).subscribe({
      next: (quiz) => {

        if (quiz) {
          this.quiz = quiz;
          this.timeLeft = this.quiz.timelimit * 60;
          this.quizResults.quizId = this.quiz.id;
        }
        const timeLeftStorage = sessionStorage.getItem('timeLeft');
    
        if (timeLeftStorage) {
          this.timeLeft = parseInt(timeLeftStorage);
        } 
    
      },
      error: (error) => {
        console.log(error);
      }});

    this.questionsSubscription = combineLatest([
      this.quizService.getAssignedQuestions(),
      this.quizService.getAllQuestions(),
    ]).pipe(
      mergeMap(([dataAssignedQuestions, dataAllQuestions]) => {

        const asquestionIds = dataAssignedQuestions
          .filter(asquestion => asquestion.quizId === this.id)
          .map(asquestion => asquestion.questionId);
    
        const quizQuestions = dataAllQuestions.filter(question => asquestionIds.includes(question.id));
    
        this.quizQuestions = quizQuestions;
        this.quizResults.totalQuestions = quizQuestions.length;
    
        if (this.timeLeft) {
          this.startTimer();
        }
    
        return [];
      })
    ).subscribe({
      error: (error) => {
        console.log(error);
      }
    });
    
    this.userSubscription = this.authService.getUser().subscribe(user => {
      this.user = user;
      this.quizResults.userId = this.user.id;
    });

  }

  startTimer() {

    this.timer = setInterval(() => {
      if (this.timeLeft > 0) {
        this.timeLeft--;
        sessionStorage.setItem('timeLeft', this.timeLeft.toString());
      } else {

        this.quizCompletedActions();
      }
    }, 1000); 
  }

  formatTime(seconds: number): string {
    const minutes: number = Math.floor(seconds / 60);
    const remainingSeconds: number = seconds % 60;
    return `${this.padNumber(minutes)}:${this.padNumber(remainingSeconds)}`;
  }
  
  padNumber(value: number): string {
    return value < 10 ? `0${value}` : `${value}`;
  }

  @HostListener('window:beforeunload', ['$event'])
  unloadHandler(event: Event): void {
    sessionStorage.setItem('timeLeft', this.timeLeft.toString());
  }


  onAnswer(answer: string) {

    this.question = this.quizQuestions[this.questionIndex];

    if (answer === this.question?.answer)  {
        this.quizResults.score++;
    }

    if (this.questionIndex < this.quizQuestions.length - 1) {
      this.questionIndex++;
    }
    else {
      this.quizResults.questionsAnswered = this.quizResults.totalQuestions;

      this.quizService.addQuizResults(this.quizResults);
      this.quizCompletedActions();
    }
  }

  quizCompletedActions()  { 

    this.quizCompleted = true;

    if (this.quiz.timelimit) {
      this.finalTime = this.timeLeft;
      this.timeLeft = 0;
      sessionStorage.setItem('timeLeft', '0');
      clearInterval(this.timer);
    }
  }

  ngOnDestroy() {

    if (this.quizSubscription) {
      this.quizSubscription.unsubscribe();
    }

    if (this.questionsSubscription) {
      this.questionsSubscription.unsubscribe();
    }

    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }

    clearInterval(this.timer);
    sessionStorage.removeItem('timeLeft');
  }

}
