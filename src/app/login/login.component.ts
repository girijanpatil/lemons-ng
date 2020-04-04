import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { AuthService } from 'src/app/services/auth/auth.service';
import { Auth } from 'src/app/models/auth';
import { Resp } from 'src/app/models/resp';
import { Role } from 'src/app/enums/role.enum';
import { Router } from '@angular/router';
import { retry } from 'rxjs/operators';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  isLoading = false;
  loginForm: FormGroup;

  constructor(private fb: FormBuilder, private authService: AuthService, private router: Router) {  }

  ngOnInit() {
    if (this.authService.user !== null) {
      const route = this.authService.getRoute();
      this.router.navigate([route]);
    }

    this.loginForm = this.fb.group({
      email: this.fb.control(null, [Validators.required, Validators.email]),
      password: this.fb.control(null, Validators.required)
    });
  }

  login() {
    this.isLoading = true;
    if (this.loginForm.valid) {
      this.authService.login(this.loginForm.value).subscribe((resp: Resp<Auth>) => {
        // console.log(resp);
        const route = this.authService.getRoute();
        this.router.navigate([route]);
      });
    }
    this.isLoading = false;
  }
}
