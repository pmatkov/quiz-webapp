import { Component, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Observable, Subscription, map } from 'rxjs';
import { AssignedQuestion } from 'src/app/quiz/assigned-question.model';
import { OpenAiResult } from 'src/app/quiz/openai-result.model';
import { Question } from 'src/app/quiz/question.model';
import { QuizCategory } from 'src/app/quiz/quiz-category.model';
import { Quiz } from 'src/app/quiz/quiz.model';
import { QuizService } from 'src/app/quiz/quiz.service';
import { DataService } from 'src/app/shared/data.service';
import { ValidatorService } from 'src/app/shared/validator.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-admin-questions',
  templateUrl: './admin-questions.component.html',
  styleUrls: ['../admin.css']
})

export class AdminQuestionsComponent implements OnInit, OnDestroy {

  questions : Question[] = [];
  questionsSubscription : Subscription | null = null;

  assignedQuestions : AssignedQuestion[] = [];
  assignedQuestionsSubscription : Subscription | null = null;

  categories : QuizCategory[] = [];
  categoriesSubscription : Subscription | null = null;

  quizzes : Quiz[] = [];
  quizzesSubscription : Subscription | null = null;

  selectedQuestion : Question | null = null;
  questionForm! : FormGroup;
  optionsArray!: FormArray;
  mode : string = '';

  openAi: boolean = false;
  waiting: boolean = false;
  aiCategory : string = '';
  aiAnswers : number = 3;

  openAiImg : string = environment.API_URL + '/assets/img/' + 'openai.png';

  constructor(private fb : FormBuilder, private quizService: QuizService, private dataService: DataService, private validatorService: ValidatorService) {}

  ngOnInit() {

    this.questionsSubscription = this.quizService.getAllQuestions()
    .subscribe(quizQuestions => {
      this.questions = quizQuestions;
    });

    this.assignedQuestionsSubscription = this.quizService.getAssignedQuestions()
    .subscribe(assignedQuestions => {
      this.assignedQuestions = assignedQuestions;
    });

    this.categoriesSubscription = this.quizService.getQuizCategories()
    .subscribe(categories => {
      this.categories = categories; 
    });

    this.quizzesSubscription = this.quizService.getQuizzes()
    .subscribe(quizzes => {
      this.quizzes = quizzes;
    });

    this.initForm();

  }

  initForm() {
    this.optionsArray = new FormArray([
      new FormControl('', Validators.required),
      new FormControl('', Validators.required),
      new FormControl('', Validators.required)
    ]);

    this.questionForm = this.fb.group({
      'id' : new FormControl('', null),
      'text' : new FormControl('', Validators.required),
      'options': this.optionsArray,
      'answer' : new FormControl('', Validators.required)
    });

    this.optionsArray.valueChanges.subscribe(values => {
      const answerValue = this.questionForm.get('answer')?.value;
      if (values.every((val: string) => val !== answerValue)) {
        this.questionForm.get('answer')?.setValue('');
      }
    });
  }

  updateForm(): void {
    this.optionsArray.clear();

    this.selectedQuestion?.options.forEach(option => {
      this.optionsArray.push(new FormControl(option, Validators.required));
    });

    this.questionForm.patchValue({
      'id': this.selectedQuestion?.id,
      'text': this.selectedQuestion?.text,
      'answer': this.selectedQuestion?.answer
    });

  }

  getArrayControls() {
    return (<FormArray>this.questionForm.get('options')).controls;
  }

  getErrorMessages(control: AbstractControl, patterns?: string[] | null, prefix?: string): string[] {
    return this.validatorService.generateErrorMsgs(control, patterns, prefix);
  }

  addOption() {
    this.optionsArray.push(new FormControl('', Validators.required));
  }

  removeOption(index: number) {
    this.optionsArray.removeAt(index);
  }

  isQuestionAssigned(id: string): Observable<boolean> {
    return this.quizService.getAssignedQuestions().pipe(
      map(asquestions => asquestions.some(asquestion => asquestion.questionId === id))
    );
  }

  getQuestionTooltip(id: string) {

    const questions = this.assignedQuestions.filter(asquestion => asquestion.questionId === id);
    const quizzes = this.quizzes.filter(quiz => questions.some(questions => questions.quizId === quiz.id));
    const names = quizzes.map(quiz => quiz.title).join(', ');

    return names ? 'Unable to delete. First remove from ' + 
      (quizzes.length > 1 ? 'quizzes: ' : 'quiz: ') + names : '';

  }

  showDetails(question: Question) {

    const index = this.questions.findIndex(q => q.id === question.id);

    if (index !== -1) {
      this.questions[index].toggled = !this.questions[index].toggled;
      this.quizService.quizQuestionsSubject.next([...this.questions]);
    }

  } 
  addQuestion() {
    this.initForm();
    this.mode = 'add';
  }

  editQuestion(question: Question) {
    this.selectedQuestion = {...question};
    this.updateForm(); 
    console.log(this.getArrayControls());

    this.mode = 'edit';
  }

  deleteQuestion(id: string) {
    this.quizService.deleteQuestion(id);
  }

  onCancel() {
    this.mode = '';
    this.selectedQuestion = null;
  }

  onSubmit() {
    if (this.mode === 'add' ) {
      const { id, ...question} = this.questionForm.value;
      question.timestamp = new Date();
      this.quizService.addQuestion(question).subscribe();
    } 
    else if (this.mode === 'edit') {
      this.quizService.editQuestion({...this.questionForm.value, timestamp: new Date()});
    }
    this.onCancel();
  }

  toggleOpenAi() {
    this.openAi = !this.openAi;
  }

  generateQuestion() {

    this.waiting = !this.waiting;

    console.log(this.aiCategory, this.aiAnswers.toString());

    this.dataService.generateQuestion({category: this.aiCategory, answers: this.aiAnswers.toString()})
    .subscribe({
      next: (res:{status: string, result?: OpenAiResult }) => {
        console.log("Generated: ", res);

        if (res.status === 'OK' && res.result) {

          const question : any = {
            text: res.result.question!,
            options: res.result.options!,
            answer: res.result.answer!,
            timestamp: new Date(),
          }

          this.quizService.addQuestion(question).subscribe(() => {
        
              this.questions[this.questions.length-1].openAi = true;
              this.quizService.quizQuestionsSubject.next([...this.questions]);
              this.openAi = !this.openAi;
              this.waiting = !this.waiting;

          });
        }
    },
      error: (error) => {
        console.log(error);
    }});

  }

  ngOnDestroy() {

    if (this.questionsSubscription) {
      this.questionsSubscription.unsubscribe();
    }

    if (this.assignedQuestionsSubscription) {
      this.assignedQuestionsSubscription.unsubscribe();
    }

    if (this.categoriesSubscription) {
      this.categoriesSubscription.unsubscribe();
    }


    if (this.quizzesSubscription) {
      this.quizzesSubscription.unsubscribe();
    }

  }

}
