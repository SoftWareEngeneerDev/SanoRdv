import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'replaceVariables'
})
export class ReplaceVariablesPipe implements PipeTransform {
  transform(value: string, notif: any): string {
    if (!value) return '';

    const dateRdvFormatee = notif.dateRdv ? new Date(notif.dateRdv).toLocaleString() : '';

    return value
      .replace(/\{\{medecinNom\}\}/g, notif.medecinNom || '')
      .replace(/\{\{dateRdv\}\}/g, dateRdvFormatee);
  }
}
