export class Question {

    id : string = '';
    text: string = '';
    options : string[] = [];
    answer : string = '';
    timestamp: Date = new Date();
    toggled? : boolean = false;
    openAi?: boolean = false;

}
  