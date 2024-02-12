import { Component, Input } from '@angular/core';
import { QuizResults } from '../quiz-results.model';

@Component({
  selector: 'app-quiz-results',
  templateUrl: './quiz-results.component.html',
  styleUrls: ['./quiz-results.component.css']
})
export class QuizResultsComponent {

  @Input() questionsLength : number | undefined;
  @Input() quizResults: QuizResults | undefined;
  @Input() finalTime: number | undefined;
  @Input() timeLimit: boolean | undefined;

}
