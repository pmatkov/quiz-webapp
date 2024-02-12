import { Injectable } from '@angular/core';
import { DataService } from '../shared/data.service';
import { BehaviorSubject, Observable, forkJoin, map, of, switchMap } from 'rxjs';
import { Quiz } from './quiz.model';
import { QuizCategory } from './quiz-category.model';
import { Question } from './question.model';
import { QuizResults } from './quiz-results.model';
import { AssignedQuestion } from './assigned-question.model';

@Injectable({
  providedIn: 'root'
})

export class QuizService {

  logoColors : string[] = ['DarkCyan', 'Moccasin', 'BurlyWood', 'Khaki', 'Silver', 'DarkGrey', 'CadetBlue', 'Grey'];
  categoryColors : string[] = ['BurlyWood', 'LightBlue', 'Thistle', 'LightSteelBlue', 'Silver'];
  categoryImages : string[] = ['bullseye-gradient.png', 'liquid-cheese.png', 'sun-tornado.png', 'radiant-gradient.png', 'slanted-gradient.png'];

  categoriesColorMap: Map<string, {color: string, image: string}> = new Map();
  quizzesColorMap: Map<string, string> = new Map();

  private quizzes : Quiz[] = [];
  quizzesSubject : BehaviorSubject<Quiz[]> = new BehaviorSubject<Quiz[]>([]);

  private quizCategories : QuizCategory[] = [];
  quizCategoriesSubject : BehaviorSubject<QuizCategory[]> = new BehaviorSubject<QuizCategory[]>([]);

  private quizQuestions : Question[] = [];
  quizQuestionsSubject : BehaviorSubject<Question[]> = new BehaviorSubject<Question[]>([]);

  private assignedQuestions : AssignedQuestion[] = [];
  assignedQuestionsSubject : BehaviorSubject<AssignedQuestion[]> = new BehaviorSubject<AssignedQuestion[]>([]);

  private quizResults : QuizResults[] = [];
  quizResultsSubject : BehaviorSubject<QuizResults[]> = new BehaviorSubject<QuizResults[]>([]);

  constructor(private dataService : DataService) {
 
    forkJoin({
      categoriesResponse: this.dataService.getCategories(),
      quizzesResponse: this.dataService.getQuizzes()
    }).subscribe({
      next: ({ categoriesResponse, quizzesResponse }) => {
        const categories = categoriesResponse.categories;
        console.log("Categories: ", categories);
    
        if (categoriesResponse.status === 'OK') {
          this.quizCategories = categories!;
    
          this.quizCategories.forEach((category) => {
            category = this.assignCategoryColor(category);
          });
    
          this.quizCategoriesSubject.next([...this.quizCategories]);
        }
    
        const quizzes = quizzesResponse.quizzes;
        console.log("Quizzes: ", quizzes);
    
        if (quizzesResponse.status === 'OK') {
          this.quizzes = quizzes!;
    
          this.quizzes.forEach((quiz) => {
            const category = this.quizCategories.find(cat => cat.id === quiz.categoryId);
            quiz.categoryName = category?.name;
    
            if (!this.quizzesColorMap.has(quiz.id)) {
              const color = this.logoColors[Math.floor(Math.random() * this.logoColors.length)];
              quiz.color = color;
            }
          });
    
          this.quizzesSubject.next([...this.quizzes]);
        }
      },
      error: (error) => {
        console.error(error);
      }
    });
    

      this.dataService.getQuizResults().subscribe({
        next: (res: {status: string, quizResults?: QuizResults[]}) => {
          console.log("Quiz results: ", res);
  
          if (res.status === 'OK') {
            this.quizResults = res.quizResults!;  
            this.quizResultsSubject.next([...this.quizResults]);
          }
        },
        error: (err) => {
          console.error(err);
        }});

      this.dataService.getQuestions().subscribe({
        next: (res: {status: string, questions?: Question[]}) => {
          console.log("Questions: ", res);
  
          if (res.status === 'OK') {

            this.quizQuestions = res.questions!;  
            this.quizQuestionsSubject.next([...this.quizQuestions]);
          }
        },
        error: (err) => {
          console.error(err);
        }});

      this.dataService.getAssignedQuestions().subscribe({
        next: (res: {status: string, assignedQuestions?: AssignedQuestion[]}) => {
          console.log("Assigned questions: ", res);
  
          if (res.status === 'OK') {
            this.assignedQuestions = res.assignedQuestions!;             
            this.assignedQuestionsSubject.next([...this.assignedQuestions]);
          }
        },
        error: (err) => {
          console.error(err);
        }});
   }

   // quizzes

  getQuizzes() {
    return this.quizzesSubject;
  }

  getQuiz(id: string): Observable<Quiz | null> {

    return this.quizzesSubject.asObservable()
    .pipe(
      map(quiz => quiz.find(quiz => quiz.id === id) || null));
  }

addQuiz(quiz: Quiz): Observable<string> {

  return this.dataService.addQuiz(quiz).pipe(
    map((res: { status: string, insertId?: string }) => {
      console.log("Added: ", res);

      if (res.status === 'OK' && res.insertId) {
        const category = this.quizCategories.find(c => c.id === quiz.categoryId);
        quiz.categoryName = category?.name;

        this.quizzes.push({ ...quiz, id: res.insertId });
        this.quizzesSubject.next([...this.quizzes]);

        return res.insertId;
      } else {
        throw new Error("Failed to add quiz");
      }
    })
  );
}

   editQuiz(quiz: Quiz): Observable<string> {
    
   return this.dataService.editQuiz(quiz).pipe(
      map((res: {status: string, changedRows?: string }) => {
        console.log("Edited: ", res);

        if (res.status === 'OK') {

          const category = this.quizCategories.find(c => c.id === quiz.categoryId);
          quiz.categoryName = category?.name;

          this.quizzes[this.quizzes.findIndex(q => q.id == quiz.id)] = quiz;
          this.quizzesSubject.next([...this.quizzes]);

      return 'OK';
    } else {
      throw new Error("Failed to add quiz");
    }
  })
  );
}

  deleteQuiz(id: string) {

    this.dataService.deleteQuiz(id).subscribe({
      next: (res: {status: string, affectedRows?: string }) => {
        console.log(res);

        if (res.status === 'OK') {
          this.quizzes.splice(this.quizzes.findIndex(q => q.id == id), 1);
          this.quizzesSubject.next([...this.quizzes]);
        }
      },
      error: (err) => {
        console.log(err);
      }});
  };

  // categories

  getQuizCategories() {
    return this.quizCategoriesSubject;
  }

  getQuizCategory(id: string): Observable<QuizCategory | null> {

    return this.quizCategoriesSubject.asObservable()
    .pipe(
      map(quizCategory => quizCategory.find(quizCategory => quizCategory.id === id) || null));

  }

  addCategory(category: QuizCategory) {

    console.log(category);

    this.dataService.addCategory(category).subscribe({
      next: (res:{status: string, insertId?: string }) => {
        console.log("Added: ", res);

        if (res.status === 'OK') {
          category = this.assignCategoryColor({...category, id: res.insertId!});
          
          this.quizCategories.push(category);
          this.quizCategoriesSubject.next([...this.quizCategories]);
        }
    },
    error: (err) => {
      console.log(err);
    }});
  }

  editCategory(category: QuizCategory) {
    
    this.dataService.editCategory(category).subscribe({
      next: (res: {status: string, changedRows?: string }) => {
        console.log("Edited: ", res);

        if (res.status === 'OK') {
          this.quizCategories[this.quizCategories.findIndex(c => c.id == category.id)] = category;
          this.quizCategoriesSubject.next([...this.quizCategories]);
        }
      },
      error: (err) => {
        console.log(err);
      }});
   }

  deleteCategory(id: string) {

    this.dataService.deleteCategory(id).subscribe({
      next: (res: {status: string, affectedRows?: string }) => {
        console.log(res);

        if (res.status === 'OK') {
          this.quizCategories.splice(this.quizCategories.findIndex(c => c.id == id), 1);
          this.quizCategoriesSubject.next([...this.quizCategories]);
        }
      },
      error: (err) => {
        console.log(err);
      }});
    };


  // questions

  getAllQuestions() {
    return this.quizQuestionsSubject;
  }

 
  addQuestion(question: Question): Observable<Question> {

    console.log(question);

    return new Observable<Question>(observer => {

    this.dataService.addQuestion(question).subscribe({
      next: (res:{status: string, insertId?: string }) => {
        console.log("Added: ", res);

        if (res.status === 'OK') {

          const insertedQuestion = { ...question, id: res.insertId! };
          this.quizQuestions.push(insertedQuestion);
          this.quizQuestionsSubject.next([...this.quizQuestions]);

          observer.next(insertedQuestion);
          observer.complete(); 
        }
    },
      error: (err) => {
      console.log(err);
      observer.error(err);
      }
    });
  });
  }

  editQuestion(question: Question) {
    
    this.dataService.editQuestion(question).subscribe({
      next: (res: {status: string, changedRows?: string }) => {
        console.log("Edited: ", res);

        if (res.status === 'OK') {
          this.quizQuestions[this.quizQuestions.findIndex(q => q.id == question.id)] = question;
          this.quizQuestionsSubject.next([...this.quizQuestions]);
        }
      },
      error: (err) => {
        console.log(err);
      }});
   }

  deleteQuestion(id: string) {

    this.dataService.deleteQuestion(id).subscribe({
      next: (res: {status: string, affectedRows?: string }) => {
        console.log(res);

        if (res.status === 'OK') {
          this.quizQuestions.splice(this.quizQuestions.findIndex(q => q.id == id), 1);
          this.quizQuestionsSubject.next([...this.quizQuestions]);
        }
      },
      error: (err) => {
        console.log(err);
      }});
  };

  // assigned questions

  getAssignedQuestions() {
    return this.assignedQuestionsSubject;
  }

  addAssignedQuestion(assignedQuestion: AssignedQuestion) {

    console.log(assignedQuestion);

    this.dataService.addAssignedQuestion(assignedQuestion).subscribe({
      next: (res:{status: string, insertId?: string }) => {
        console.log("Added: ", res);

        if (res.status === 'OK') {
          this.assignedQuestions.push({ ...assignedQuestion, id: res.insertId!});
          this.assignedQuestionsSubject.next([...this.assignedQuestions]);
        }
    },
      error: (err) => {
      console.log(err);
    }});
  }

  editAssignedQuestion(assignedQuestion: AssignedQuestion) {
    
    this.dataService.editAssignedQuestion(assignedQuestion).subscribe({
      next: (res: {status: string, changedRows?: string }) => {
        console.log("Edited: ", res);

        if (res.status === 'OK') {
          this.assignedQuestions[this.assignedQuestions.findIndex(q => q.id == assignedQuestion.id)] = assignedQuestion;
          this.assignedQuestionsSubject.next([...this.assignedQuestions]);
        }
      },
      error: (err) => {
        console.log(err);
      }});
   }

   deleteAssignedQuestion(id: string) {

    this.dataService.deleteAssignedQuestion(id).subscribe({
      next: (res: {status: string, affectedRows?: string }) => {
        console.log(res);

        if (res.status === 'OK') {
          this.assignedQuestions.splice(this.assignedQuestions.findIndex(q => q.id == id), 1);
          this.assignedQuestionsSubject.next([...this.assignedQuestions]);
        }
      },
      error: (err) => {
        console.log(err);
      }});
  };

  // results

  addQuizResults(quizResult: QuizResults) {

    console.log(quizResult);

    this.dataService.addQuizResult(quizResult).subscribe({
      next: (res:{status: string, insertId?: string }) => {
        console.log("Added: ", res);

        if (res.status === 'OK') {
          this.quizResults.push({ ...quizResult, id: res.insertId!});
          this.quizResultsSubject.next([...this.quizResults]);
        }
      },
      error: (err) => {
        console.error(err);
      }});

  };

  getQuizResults() {
    
    return this.quizResultsSubject;
  }


  assignCategoryColor(category: QuizCategory) {

    if (!this.categoriesColorMap.has(category.id)) {
    
      const color = this.categoryColors[this.categoriesColorMap.size % this.categoryColors.length];
      const image = this.categoryImages[this.categoriesColorMap.size % this.categoryImages.length];

      this.categoriesColorMap.set(category.id, {color, image});
      category.color = color;
      category.image = image;

    }
    else {
      category.color = this.categoriesColorMap.get(category.id)?.color;
      category.image = this.categoriesColorMap.get(category.id)?.image;
    }
    
    return category;
  }

}
