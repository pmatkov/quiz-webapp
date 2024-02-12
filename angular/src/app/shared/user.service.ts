import { Injectable } from '@angular/core';
import { User } from '../users/user.model';
import { BehaviorSubject} from 'rxjs';
import { DataService } from './data.service';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private users : User[] = [];
  usersSubject : BehaviorSubject<User[]> = new BehaviorSubject<User[]>([]);

  constructor(private dataService: DataService) {

    this.dataService.getUsers().subscribe({
      next: (res: { status: string, users?: User[]}) => {
        
        console.log("Users: ", res);

        if (res.status === 'OK') {
          this.users = res.users!;
          this.usersSubject.next([...this.users]);    
        }
      },
      error: (error) => {
        console.log(error);
      }});

  }

  getUsers() {
    return this.usersSubject;
  }

  addUser(user: User) {

    this.dataService.addUser(user).subscribe({
    next: (res:{ status: string, insertId?: string }) => {

    console.log("Added: ", res);

    if (res.status === 'OK') {
        this.users.push({...user, id: res.insertId!});
        this.usersSubject.next([...this.users]);
      }
    },
    error: (error) => {
        console.log(error);
    }});
  };

  editUser(user: User) {
  
    this.dataService.editUser(user).subscribe({
    next: (res: { status: string, changedRows?: string }) => {

    console.log("Edited: ", res);
      if (res.status === 'OK') {
        this.users[this.users.findIndex(u => u.id == user.id)] = user;
        this.usersSubject.next([...this.users]);
      }
    },
    error: (error) => {
        console.log(error);
    }});
  }

  deleteUser(id: string) {

    this.dataService.deleteUser(id).subscribe({
      next: (res: { status: string, affectedRows?: string }) => {

        console.log(res);

        if (res.status === 'OK') {
          this.users.splice(this.users.findIndex(user => user.id == id), 1);
          this.usersSubject.next([...this.users]);
        }
      },
      error: (error) => {
        console.log(error);
      }});
    };

  getUser(id: string) {
    return this.users.find(user => user.id == id);
  }

}
