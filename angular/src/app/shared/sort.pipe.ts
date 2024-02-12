import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'sort'
})
export class SortPipe implements PipeTransform {

  transform(array : any[], sortCol: string, sortUp: boolean): any[] {
   
    if (!array)
      return [];
      
    if (!sortCol)
      return array;

    return array.sort((a: any, b: any) => {

       if (sortCol == 'username')
          return sortUp ? a[sortCol].localeCompare(b[sortCol]) : b[sortCol].localeCompare(a[sortCol]);
        else {
          return sortUp ? Math.floor(a[sortCol]) - Math.floor(b[sortCol]) : Math.floor(b[sortCol]) - Math.floor(a[sortCol]);
        }

    })

  }

}
