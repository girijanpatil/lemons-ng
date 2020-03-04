import { Injectable, NgZone } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

@Injectable({
  providedIn: 'root'
})
export class MessageService {

  constructor(
    private zone: NgZone,
    private toastr: ToastrService
    ) { }

  
  success(message: string, title='') {
    this.toastr.success(title, message, {
      'positionClass' : 'toast-bottom-right'
    });
  }

  error(message: string, title='') {
    this.toastr.error(title, message, {
      'positionClass' : 'toast-bottom-right'
    });
  }
}

