import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'dateStringToDate'
})
export class DateStringToDatePipe implements PipeTransform {
  transform(value: string): Date | null {
    if (!value) return null;
    return new Date(value);
  }
}

