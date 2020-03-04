// Angular Core
  import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
  import { NgModule, ErrorHandler, NO_ERRORS_SCHEMA } from '@angular/core';
  import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
  import { CommonModule, LocationStrategy, HashLocationStrategy } from '@angular/common';
  import { ReactiveFormsModule } from '@angular/forms';
  import { FlexLayoutModule } from '@angular/flex-layout';

// Routes
  import { AppRoutingModule } from './app-routing.module';

// NGX-Bootstrap
  import { ModalModule, BsModalRef } from 'ngx-bootstrap/modal';
  import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
  import { ToastrModule } from 'ngx-toastr';

// Validation & Error Handling
  import { DigitOnlyModule } from '@uiowa/digit-only';
  import { AuthInterceptor } from './interceptors/auth.interceptor';
  import { ErrorHandlerService } from './services/error-handler/error-handler.service';

// Components
  import { AppComponent } from './app.component';
  import { LoginComponent } from './login/login.component';
  import { SidebarComponent } from './sidebar/sidebar.component';
  import { HeaderComponent } from './header/header.component';
  import { BreadcrumbComponent } from './breadcrumb/breadcrumb.component';
  import { HomeComponent } from './home/home.component';
  import { FxorderComponent } from './fxorder/fxorder.component';
  import { FxorderDialogComponent } from './fxorder/fxorder-dialog/fxorder-dialog.component';
  import { FxorderUpdateDialogComponent } from './fxorder/fxorder-update-dialog/fxorder-update-dialog.component';


@NgModule({
  imports: [
    CommonModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    HttpClientModule,
    FlexLayoutModule,
    ReactiveFormsModule,
    DigitOnlyModule,
    ModalModule.forRoot(),
    BsDatepickerModule.forRoot(),
    ToastrModule.forRoot()
  ],
  declarations: [
    AppComponent,
    LoginComponent,
    SidebarComponent,
    HeaderComponent,
    BreadcrumbComponent,
    HomeComponent,
    FxorderComponent,
    FxorderDialogComponent,
    FxorderUpdateDialogComponent
  ],
  entryComponents: [
    FxorderDialogComponent,
    FxorderUpdateDialogComponent
  ],
  providers: [
    { 
      provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true},
    // { provide: LocationStrategy, useClass: HashLocationStrategy },
    { provide: ErrorHandler, useClass: ErrorHandlerService},
    BsModalRef
  ],
  bootstrap: [AppComponent],
  schemas: [ NO_ERRORS_SCHEMA ]
})
export class AppModule { }
