import { Injectable, ErrorHandler, Injector } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class ErrorHandlerService implements ErrorHandler {

  constructor(private injector: Injector, private authService: AuthService) { }

  /** Error handler to handle exceptions */
  handleError(error: any): void {
    console.log(error);
    const msg = this.getMessage(error);
    alert(msg);
    // this.messageService.displayErrorMessage(msg);

    if (error.status === 401) {
      this.authService.logout();
      const router = this.injector.get(Router);
      router.navigate(['auth/login']);
    }
  }

  getMessage(error) {

    if (error.error && error.error.errors) {
      const objArr = Object.keys(error.error.errors);
      let errMsg = '';

      objArr.forEach((v, i) => {
        const errArr = error.error.errors[v];
        errArr.forEach((v1, i1) => {
          errMsg += v1 + '\n';
        });
      });

      return errMsg;
    }

    if (error.error) {
      if (error.error.Message) {
        return error.error.Message;
      }
    }

    if (error.message) {
      return error.message;
    }
  }
}
