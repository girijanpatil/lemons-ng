import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { HomeComponent } from './home/home.component';
import { FxorderComponent } from './fxorder/fxorder.component';


const routes: Routes = [
  { 
    path: '', 
    redirectTo: 'auth/login', 
    pathMatch: 'full'
  },
  { 
    path: 'auth', 
    redirectTo: 'auth/login', 
    pathMatch: 'full'
  },
  { 
    path: 'user', 
    redirectTo: 'user/welcome', 
    pathMatch: 'full'
  },
  {
    path: 'auth/login',
    component: LoginComponent
  },
  { 
    path: 'user/welcome',
    component: HomeComponent,
    data: {
      breadcrumb: 'Welcome',
      baseUrl: 'user/welcome'
    }
  },
  { 
    path: 'user/fxorder',
    component: FxorderComponent,
    data: {
      breadcrumb: 'FX Orders',
      baseUrl: 'user/fxorder'
    }
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
