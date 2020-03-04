import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/auth/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  name: string;
  loggedIn: boolean;

  constructor(private authService: AuthService, private router: Router) {
    const user = this.authService.getUser();
    this.name = user.name;
    this.loggedIn = authService.isAuthenticated();
   }

  logout() {
    this.authService.logout();
    this.router.navigate(['auth']);
  }

  ngOnInit() {
  }

}
