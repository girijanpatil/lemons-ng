import { Component } from '@angular/core';
import { AuthService } from './services/auth/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'Lemons Trading Screen';
  name  = 'User Name';

  constructor(private authService: AuthService, private router: Router) {
    const user = this.authService.getUser();
    this.name = "";//user.name;
   }

  isLoggedIn() {
    return this.authService.isAuthenticated();
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['auth']);
  }
}
