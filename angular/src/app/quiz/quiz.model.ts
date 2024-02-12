export class Quiz {

    id : string = '';
    title : string = '';
    description : string = '';
    timelimit : number = 0;
    timestamp: Date = new Date();
    categoryId : string = '';
    categoryName? : string = '';

    color? : string = '';
    showDescription? : boolean = false;
    showOverlay? : boolean = false;
}
  