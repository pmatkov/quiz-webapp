import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filter'
})
export class FilterPipe implements PipeTransform {

  transform(array : any[], field: string, selectedValues: string[], query?: string): any[] {

    if (!array || !field || (selectedValues.length == 0 && !query)) 
      return array;

    let filteredArray = array;

    if (selectedValues.length) {
      filteredArray = array.filter(item => selectedValues.includes(item[field]));
    }

    if (query) {
      filteredArray = filteredArray.filter(item => item.title.toLowerCase().includes(query.toLowerCase()));
    }

    return filteredArray;
  }

}
