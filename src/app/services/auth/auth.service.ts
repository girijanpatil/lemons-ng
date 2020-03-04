import { Injectable } from '@angular/core';
import { HttpService } from '../http/http.service';
import { map } from 'rxjs/operators';
import { Resp } from 'src/app/models/resp';
import { Auth } from 'src/app/models/auth';
import { User } from 'src/app/models/user';
import { Role } from 'src/app/enums/role.enum';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  user: User;
  token: string;
  name = '';

  constructor(private http: HttpService) {
    this.user = JSON.parse(localStorage.getItem('u'));
    this.token = localStorage.getItem('t');
  }

  private BASE_PATH = 'Auth/';

  login(model) {
    return this.http.post(this.BASE_PATH + 'Login', model).pipe(map((resp: Resp<Auth>) => {
      if (resp.data !== null) {
        this.user = resp.data.user;
        this.token = resp.data.token;

        localStorage.setItem('t', resp.data.token);
        localStorage.setItem('u', JSON.stringify(resp.data.user));

        if (this.user != null) {
          this.name = this.user.name;
        }
      }
      return resp;
    }));
  }

  register(model) {
    return this.http.post(this.BASE_PATH + 'Register', model);
  }

  /** Checks if the user object is saved in the local storage which only happens on authentication */
  isAuthenticated(): boolean {
    if (this.user) {
      return true;
    }
    return false;
  }

  /** Gets the user from local storage */
  getUser(): User {
    return this.user;
  }

  /** Gets the JWT from local storage */
  getJwt() {
    return this.token;
  }

  /** Removes user from local storage to log the user out */
  logout(): void {
    localStorage.removeItem('u');
    localStorage.removeItem('t');
    localStorage.removeItem('rt');

    this.user = null;
    this.token = null;

  }

  /** Gets route from user */
  getRoute() {
    const ur = this.user.roles.find(f => f === Role.User);
    const ar = this.user.roles.find(f => f === Role.Admin);

    if (ur !== null && ur !== undefined) {
      return ur.toLowerCase();
    }

    if (ar !== null && ar !== undefined) {
      return ar.toLowerCase();
    }
  }
}

