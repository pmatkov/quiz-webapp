import { Component, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Observable, Subscription, map } from 'rxjs';
import { AssignedQuestion } from 'src/app/quiz/assigned-question.model';
import { Question } from 'src/app/quiz/question.model';
import { QuizCategory } from 'src/app/quiz/quiz-category.model';
import { Quiz } from 'src/app/quiz/quiz.model';
import { QuizService } from 'src/app/quiz/quiz.service';
import { ValidatorService } from 'src/app/shared/validator.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-admin-quizzes',
  templateUrl: './admin-quizzes.component.html',
  styleUrls: ['./admin-quizzes.component.css']
})
export class AdminQuizzesComponent implements OnInit, OnDestroy {

  quizzes : Quiz[] = [];
  quizzesSubscription : Subscription | null = null;

  quizCategories : QuizCategory[] = [];
  quizCategoriesSubscription : Subscription | null = null;

  quizQuestions : Question[] = [];
  quizQuestionsSubscription : Subscription | null = null;

  assignedQuestions : AssignedQuestion[] = [];
  assignedQuestionsSubscription : Subscription | null = null;

  selectedQuiz : Quiz | null = null;
  selectedCategory: QuizCategory |null = null
  quizForm! : FormGroup;
  questionsArray!: FormArray;

  mode : string = '';

  constructor(private fb : FormBuilder, private quizService: QuizService, private validatorService: ValidatorService) {}
 
  ngOnInit() {

    this.quizzesSubscription = this.quizService.getQuizzes()
    .subscribe(quizzes => {
      this.quizzes = quizzes;
    });

    this.quizCategoriesSubscription = this.quizService.getQuizCategories()
    .subscribe(quizCategories => {
      this.quizCategories = quizCategories; 
    });

    this.quizQuestionsSubscription = this.quizService.getAllQuestions()
    .subscribe(quizQuestions => {
      this.quizQuestions = quizQuestions; 
    });

    this.assignedQuestionsSubscription = this.quizService.getAssignedQuestions()
    .subscribe(assignedQuestions => {
      this.assignedQuestions = assignedQuestions; 
    });

    this.initForm();
  }

  initForm() {

    if (this.mode == 'add') {
      this.questionsArray = new FormArray([
        new FormControl('', Validators.required),
        new FormControl('', Validators.required),
        new FormControl('', Validators.required)
      ]);
    }
    else {
      this.questionsArray = this.fb.array([]);
    }

    this.quizForm = this.fb.group({
      'id' : new FormControl('', null),
      'title' : new FormControl('', Validators.required),
      'description' : new FormControl('', Validators.required),
      'category': new FormControl('', Validators.required),
      'timelimit' : new FormControl('', null),
      'questions': this.questionsArray
    });

  }

  updateForm(): void {

    this.questionsArray.clear();

    const aQuestionIds = this.assignedQuestions
    .filter(aq => aq.quizId === this.selectedQuiz?.id)
    .map(aq => aq.questionId);
    
    const quizQuestions = this.quizQuestions.filter(question => aQuestionIds.includes(question.id));

    quizQuestions
      .forEach(question =>
        this.questionsArray.push(new FormControl( question.text, Validators.required))
      );

    this.quizForm.patchValue({
      'id': this.selectedQuiz?.id,
      'title': this.selectedQuiz?.title,
      'description': this.selectedQuiz?.description,
      'category': this.selectedQuiz?.categoryName,
      'timelimit': this.selectedQuiz?.timelimit,
    });

  }

  getArrayControls() {
    return (<FormArray>this.quizForm.get('questions')).controls;
  }

  getErrorMessages(control: AbstractControl, patterns?: string[] | null, prefix?: string): string[] {
    return this.validatorService.generateErrorMsgs(control, patterns, prefix);
  }


  addQuestion() {
    this.questionsArray.push(new FormControl('', Validators.required));
  }

  removeQuestion(index: number) {
    this.questionsArray.removeAt(index);
  }

  addQuiz() {
    this.mode = 'add';
    this.initForm();
  }

  editQuiz(quiz: Quiz) {

    this.selectedQuiz = {...quiz};
    this.updateForm();
    this.mode = 'edit';
  }

  deleteQuiz(id: string) {

    this.quizService.deleteQuiz(id);
    this.assignedQuestions.forEach((asquestion: AssignedQuestion) => {

      if (asquestion.quizId == id) {
        this.quizService.deleteAssignedQuestion(asquestion.id);
      }
    });
  }

  onCancel() {
    this.mode = '';
    this.selectedQuiz = null;
  }

  onSubmit(){

    console.log(this.quizForm.value);

    const {category, questions, ...quiz} = this.quizForm.value;
    const selCategory = this.quizCategories.find(c => c.name === category);
    quiz.categoryId = selCategory ? selCategory.id : '';
    quiz.timestamp = new Date();

    const questionsIds = questions.map((question: string) => {
      const foundQuestion = this.quizQuestions.find(q => q.text === question);
      return foundQuestion ? foundQuestion.id : '';
    });

    if (this.mode === 'add') {

      const {id, ...quizMod} = quiz;

      this.quizService.addQuiz(quizMod).subscribe({
        next: (id: string) => {
      
          questionsIds.forEach((questionId: string) => {
              this.quizService.addAssignedQuestion({ quizId: id, questionId: questionId } as AssignedQuestion);
          });
        },
        error: (err) => {
          console.log(err);
        }});
    } 
    else if (this.mode === 'edit') {

      this.quizService.editQuiz(quiz).subscribe({
        next: (status: string) => {

          if (status === 'OK') {

            const asQuestions = this.assignedQuestions.filter(asQuestion => asQuestion.quizId === quiz.id);
            asQuestions.forEach(asQuestion => {
      
              if (!questionsIds.some((id : string) => id === asQuestion.questionId))
                this.quizService.deleteAssignedQuestion(asQuestion.id);
              }
            );
      
            questionsIds.forEach((questionId: string) => {
              const assignedQuestion = this.assignedQuestions.find(asQuestion => asQuestion.quizId === quiz.id && asQuestion.questionId === questionId);
            
              if (assignedQuestion) {
                assignedQuestion.questionId = questionId;
                this.quizService.editAssignedQuestion(assignedQuestion);
              }
              else  {
                this.quizService.addAssignedQuestion({ quizId: quiz.id, questionId: questionId } as AssignedQuestion);
              }
            });
          }
      
        },
        error: (err) => {
          console.log(err);
        }});
      
    }
    this.onCancel();
  }

  getQuestionsCount(id: string): Observable<number> {
    return this.quizService.assignedQuestionsSubject.pipe(
      map(questions => {
        
        return questions.filter(q => q.quizId === id).length;
      })
    );
  }

  getCategoryImage(id: string): Observable<string> {

    return this.quizService.getQuizCategory(id)
      .pipe(
        map(category => {
          
          const path : string = environment.API_URL + '/assets/img/';
          return category?.image ? path + "light-" + category.image : "";
        })
      )
  }
  
  ngOnDestroy() {

    if (this.quizzesSubscription) {
      this.quizzesSubscription.unsubscribe();
    }
    if (this.quizCategoriesSubscription) {
      this.quizCategoriesSubscription.unsubscribe();
    }
    if (this.quizQuestionsSubscription) {
      this.quizQuestionsSubscription.unsubscribe();
    }
    if (this.assignedQuestionsSubscription) {
      this.assignedQuestionsSubscription.unsubscribe();
    }
  }

}
