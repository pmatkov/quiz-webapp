import { Component, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Observable, Subscription, map } from 'rxjs';
import { QuizCategory } from 'src/app/quiz/quiz-category.model';
import { Quiz } from 'src/app/quiz/quiz.model';
import { QuizService } from 'src/app/quiz/quiz.service';
import { ValidatorService } from 'src/app/shared/validator.service';

@Component({
  selector: 'app-admin-categories',
  templateUrl: './admin-categories.component.html',
  styleUrls: ['../admin.css']
})
export class AdminCategoriesComponent implements OnInit, OnDestroy  {

  categories : QuizCategory[] = [];
  categoriesSubscription : Subscription | null = null;

  quizzes : Quiz[] = [];
  quizzesSubscription : Subscription | null = null;

  selectedCategory : QuizCategory | null = null;
  categoryForm! : FormGroup;
  mode : string = '';

  constructor(private fb : FormBuilder, private quizService: QuizService, private validatorService: ValidatorService) {}

  ngOnInit() {

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
  
    this.categoryForm = this.fb.group({
      'id' : new FormControl('', null),
      'name' : new FormControl('', Validators.required),
      'description': new FormControl('', Validators.required)
    });
  }

  updateForm(): void {

    if (this.selectedCategory) {

      this.categoryForm.patchValue({
        'id': this.selectedCategory?.id,
        'name': this.selectedCategory?.name,
        'description': this.selectedCategory?.description
      });

    }
  }

  isCategoryAssigned(id: string): Observable<boolean> {
    return this.quizService.getQuizzes().pipe(
      map(quizzes => quizzes.some(quiz => quiz.categoryId === id))
    );
  }

  getCategoryTooltip(id: string) {

    const quizzes = this.quizzes.filter(quiz => quiz.categoryId === id);
    const names = quizzes.map(quiz => quiz.title).join(', ');

    return names ? 'Unable to delete. First remove from ' +  (quizzes.length > 1 ? 
      'quizzes: ' : 'quiz: ') + names : '';
  
  }

  getErrorMessages(control: AbstractControl, patterns?: string[] | null, prefix?: string): string[] {
    return this.validatorService.generateErrorMsgs(control, patterns, prefix);
  }
  
  addCategory() {
    this.initForm();
    this.mode = 'add';
  }

  editCategory(category: QuizCategory) {
    this.selectedCategory = {...category};
    this.updateForm();    
    this.mode = 'edit';
  }

  deleteCategory(id: string) {
    this.quizService.deleteCategory(id);
  }

  onCancel() {
    this.mode = '';
    this.selectedCategory = null;
  }

  onSubmit(){

    if (this.mode === 'add') {
      const { id, ...category} = this.categoryForm.value;
      this.quizService.addCategory(category);
    } 
    else if (this.mode === 'edit') {
      this.quizService.editCategory({...this.categoryForm.value});
    }
    this.onCancel();
  }

  ngOnDestroy() {

    if (this.categoriesSubscription) {
      this.categoriesSubscription.unsubscribe();
    }

    if (this.quizzesSubscription) {
      this.quizzesSubscription.unsubscribe();
    }

  }

}
