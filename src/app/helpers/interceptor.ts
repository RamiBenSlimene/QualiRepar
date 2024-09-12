import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DataStore } from './data.store';

@Injectable()
export class Interceptor implements HttpInterceptor {
  constructor(private readonly store : DataStore) { }
  intercept(
    request: HttpRequest<unknown>,
    next: HttpHandler
  ): Observable<HttpEvent<unknown>> {
    const key: string | null = this.store.getKey();
    if (key !== null && key !== '') {
      request = request.clone({
        setHeaders: {
          api_key: key
        }
      });
    }
    return next.handle(request);
  }
}

