import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RechercheMedecinService {
  medecinService: any;
  uploadPhoto(formData: FormData, medecinId: string): Observable<any> {
    return this.medecinService.uploadPhoto(formData, medecinId);
  }
  private querySubject = new BehaviorSubject<string>('');
  private resultsSubject = new BehaviorSubject<any[]>([]);
  private suggestionsSubject = new BehaviorSubject<any[]>([]);
  private nextLettersSubject = new BehaviorSubject<string[]>([]);
  private medecinDetailsSubject = new BehaviorSubject<any[]>([]);

  query$ = this.querySubject.asObservable();
  results$ = this.resultsSubject.asObservable();
  suggestions$ = this.suggestionsSubject.asObservable();
  nextLetters$ = this.nextLettersSubject.asObservable();
  medecinDetails$ = this.medecinDetailsSubject.asObservable();

  constructor(private http: HttpClient) {}

  updateQuery(query: string) {
    this.querySubject.next(query);
  }

  search(query: string): void {
    if (!query.trim()) {
      this.clearResults();
      return;
    }

    const params: any = {
      q: query,
      type: 'all',
      limit: 10,
      includeStats: true,
      fuzzyEnabled: true,
      phoneticEnabled: true
    };

    this.http.get('http://localhost:3000/api/recherche/recherche-avancee', { params }).subscribe({
      next: (data: any) => {
        const results = data.suggestions || [];
        const nextLetters = data.nextLetters || [];
        const medecinDetails = results.map((result: any) => ({
          id: result.data?._id || result.data?.id,
          nom: result.data?.nom || 'N/A',
          specialite: result.data?.specialite || 'N/A',
          localite: result.data?.localite || 'N/A'
        }));

        this.resultsSubject.next(results);
        this.nextLettersSubject.next(nextLetters);
        this.medecinDetailsSubject.next(medecinDetails);
      },
      error: (err) => {
        console.error(err);
        this.clearResults();
      }
    });
  }

  autocomplete(query: string): void {
    if (!query.trim()) {
      this.clearResults();
      return;
    }

    const params: any = {
      q: query,
      type: 'all',
      limit: 10,
      includeStats: true,
      fuzzyEnabled: true,
      phoneticEnabled: true
    };

    this.http.get('http://localhost:3000/api/recherche/recherche-avancee', { params }).subscribe({
      next: (data: any) => {
        const suggestions = data.suggestions || [];
        const medecinDetails = suggestions.map((s: any) => ({
          id: s.data?._id || s.data?.id,
          nom: s.data?.nom || 'N/A',
          specialite: s.data?.specialite || 'N/A',
          localite: s.data?.localite || 'N/A',
          photo: s.data?.photo || 'N/A'
        }));

        this.suggestionsSubject.next(suggestions);
        this.medecinDetailsSubject.next(medecinDetails);
      },
      error: (err) => {
        console.error(err);
        this.clearResults();
      }
    });
  }

  clearResults() {
    this.resultsSubject.next([]);
    this.suggestionsSubject.next([]);
    this.nextLettersSubject.next([]);
    this.medecinDetailsSubject.next([]);
  }
}
