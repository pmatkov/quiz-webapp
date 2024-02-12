import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { User } from '../users/user.model';
import { Quiz } from '../quiz/quiz.model';
import { QuizCategory } from '../quiz/quiz-category.model';
import { Question } from '../quiz/question.model';
import { AssignedQuestion } from '../quiz/assigned-question.model';
import { QuizResults } from '../quiz/quiz-results.model';
import {environment} from "../../environments/environment";
import { OpenAiResult } from '../quiz/openai-result.model';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  constructor(private http: HttpClient) {}

  apiUser = environment.API_URL + '/api/users';
  apiQuiz = environment.API_URL + '/api/quizzes';
  apiQuizResult = environment.API_URL + '/api/quiz-results';
  apiCategory = environment.API_URL + '/api/categories';
  apiQuestion = environment.API_URL + '/api/questions';
  apiAssignedQuestion = environment.API_URL + '/api/assigned-questions';
  apiOpenAi = environment.API_URL + '/openai';

  auth = environment.API_URL + '/auth';

  private handleError(error: any) {
    console.error('Error: ', error);
    return throwError(() => new Error ("An error occurred while performing HttpClient request."));
  }

  // auth

  loginUser(credentials: { username: string; password: string }): Observable<{ status: string, description?: string, user?: User, token?: string }> {
    return this.http.post<{ status: string, description?: string, user?: User, token?: string }>(this.auth + '/login', credentials);
  }

  registerUser(user: User): Observable<{ status: string, insertId?: string, token?: string }> {
    return this.http.post<{ status: string, insertId?: string, token?: string }>(this.auth + '/register', user);
  }

  restoreUser(user: User): Observable<{ status: string, user?: User, token?: string }> {
    return this.http.post<{ status: string, user?: User, token?: string }>(this.auth + '/restore', user);
  }

   // users

  getUsers(): Observable<{ status: string, users?: User[]}> {
    return this.http.get<{ status: string, users?: User[]}>(this.apiUser);
  }

  getUser(id: string): Observable<{ status: string, user: User}> {
    return this.http.get<{ status: string, user: User}>(this.apiUser + `/${id}`);
  }

  addUser(user: User): Observable<{ status: string, insertId?: string }> {
    return this.http.post<{ status: string, insertId?: string }>(this.apiUser, user);
  }

  editUser(user: User): Observable<{ status: string, changedRows?: string}> {
    const { id, ...modUser} = user;
    return this.http.put<{ status: string, changedRows?: string}>(this.apiUser + `/${id}`, modUser);
  }

  deleteUser(id: string): Observable<{ status: string, affectedRows?: string}> {
    return this.http.delete<{ status: string, affectedRows?: string}>(this.apiUser + `/${id}`);
  }

  // quizzes

  getQuizzes(): Observable<{ status: string, quizzes?: Quiz[]}> {
    return this.http.get<{ status: string, quizzes?: Quiz[]}>(this.apiQuiz);
  }

  getQuiz(id: string): Observable<{ status: string, quiz: Quiz}> {
    return this.http.get<{ status: string, quiz: Quiz}>(this.apiQuiz + `/${id}`);
  }

  addQuiz(quiz: Quiz): Observable<{ status: string, insertId?: string }> {
    return this.http.post<{ status: string, insertId?: string }>(this.apiQuiz, quiz);
  }

  editQuiz(quiz: Quiz): Observable<{ status: string, changedRows?: string}> {
    const { id, ...modQuiz} = quiz;
    return this.http.put<{ status: string, changedRows?: string}>(this.apiQuiz + `/${id}`, modQuiz);
  }

  deleteQuiz(id: string): Observable<{ status: string, affectedRows?: string}> {
    return this.http.delete<{ status: string, affectedRows?: string}>(this.apiQuiz + `/${id}`);
  }

  // questions

  getQuestions(): Observable<{ status: string, questions?: Question[]}> {
    return this.http.get<{ status: string, questions?: Question[]}>(this.apiQuestion);
  }

  getQuestion(id: string): Observable<{ status: string, question: Question}> {
    return this.http.get<{ status: string, question: Question}>(this.apiQuestion + `/${id}`);
  }

  addQuestion(question: Question): Observable<{ status: string, insertId?: string }> {
    return this.http.post<{ status: string, insertId?: string }>(this.apiQuestion, question);
  }

  editQuestion(question: Question): Observable<{ status: string, changedRows?: string}> {
    const { id, ...modQuestion} = question;
    return this.http.put<{ status: string, changedRows?: string}>(this.apiQuestion + `/${id}`, modQuestion);
  }

  deleteQuestion(id: string): Observable<{ status: string, affectedRows?: string}> {
    return this.http.delete<{ status: string, affectedRows?: string}>(this.apiQuestion + `/${id}`);
  }

  // categories

  getCategories(): Observable<{ status: string, categories?: QuizCategory[]}> {
    return this.http.get<{ status: string, categories?: QuizCategory[]}>(this.apiCategory);
  }

  getCategory(id: string): Observable<{ status: string, category: QuizCategory}> {
    return this.http.get<{ status: string, category: QuizCategory}>(this.apiCategory + `/${id}`);
  }

  addCategory(category: QuizCategory): Observable<{ status: string, insertId?: string }> {
    return this.http.post<{ status: string, insertId?: string }>(this.apiCategory, category);
  }

  editCategory(category: QuizCategory): Observable<{ status: string, changedRows?: string}> {
    const { id, ...modCategory} = category;
    return this.http.put<{ status: string, changedRows?: string}>(this.apiCategory + `/${id}`, modCategory);
  }

  deleteCategory(id: string): Observable<{ status: string, affectedRows?: string}> {
    return this.http.delete<{ status: string, affectedRows?: string}>(this.apiCategory + `/${id}`);
  }

  // assigned questions

  getAssignedQuestions(): Observable<{ status: string, assignedQuestions?: AssignedQuestion[]}> {
    return this.http.get<{ status: string, a?: AssignedQuestion[]}>(this.apiAssignedQuestion);
  }

  getAssignedQuestion(id: string): Observable<{ status: string, assignedQuestion: AssignedQuestion}> {
    return this.http.get<{ status: string, assignedQuestion: AssignedQuestion}>(this.apiAssignedQuestion + `/${id}`);
  }

  addAssignedQuestion(assignedQuestion: AssignedQuestion): Observable<{ status: string, insertId?: string }> {
    return this.http.post<{ status: string, insertId?: string }>(this.apiAssignedQuestion, assignedQuestion);
  }

  editAssignedQuestion(assignedQuestion: AssignedQuestion): Observable<{ status: string, changedRows?: string}> {
    const { id, ...modAssignedQuestion} = assignedQuestion;
    return this.http.put<{ status: string, changedRows?: string}>(this.apiAssignedQuestion + `/${id}`, modAssignedQuestion);
  }

  deleteAssignedQuestion(id: string): Observable<{ status: string, affectedRows?: string}> {
    return this.http.delete<{ status: string, affectedRows?: string}>(this.apiAssignedQuestion + `/${id}`);
  }

  // quiz results

  getQuizResults(): Observable<{ status: string, quizResults?: QuizResults[]}> {
    return this.http.get<{ status: string, quizResults?: QuizResults[]}>(this.apiQuizResult);
  }

  getQuizResult(id: string): Observable<{ status: string, quizResult: QuizResults}> {
    return this.http.get<{ status: string, quizResult: QuizResults}>(this.apiQuizResult + `/${id}`);
  }

  addQuizResult(quizResult: QuizResults): Observable<{ status: string, insertId?: string }> {
    return this.http.post<{ status: string, insertId?: string }>(this.apiQuizResult, quizResult);
  }

  editQuizResult(quizResult: QuizResults): Observable<{ status: string, changedRows?: string}> {
    const { id, ...modQuizResult} = quizResult;
    return this.http.put<{ status: string, changedRows?: string}>(this.apiQuizResult + `/${id}`, modQuizResult);
  }

  deleteQuizResult(id: string): Observable<{ status: string, affectedRows?: string}> {
    return this.http.delete<{ status: string, affectedRows?: string}>(this.apiQuizResult + `/${id}`);
  }

  // me

  getMe(): Observable<{ status: string, user?: User }> {
    return this.http.get<{ status: string, user?: User }>(environment.API_URL + '/api/me');
  }

  // profile img

  editProfileImg(id: string, fd: FormData): Observable<{ status: string, changedRows?: string}> {
    return this.http.patch<{ status: string, changedRows?: string}>(this.apiUser + `/img/${id}`, fd);
  }

  deleteProfileImg(id: string): Observable<{ status: string, changedRows?: string}> {
    return this.http.delete<{ status: string, changedRows?: string}>(this.apiUser + `/img/${id}`);
  }

  // openAi

  generateQuestion(promptData: {category: string, answers: string}): Observable<{ status: string, result?: OpenAiResult}> {
    return this.http.post<{ status: string, result?: OpenAiResult}>(this.apiOpenAi + '/question', promptData);
  }

  generateHint(promptData: {question: string}): Observable<{ status: string, result?: OpenAiResult}> {
    return this.http.post<{ status: string, result?: OpenAiResult}>(this.apiOpenAi + '/hint', promptData);
  }


}
