import { Component, OnInit, OnDestroy, ElementRef } from '@angular/core';
import { Fxorder } from 'src/app/models/fxorder';
import { FxorderService } from 'src/app/services/fxorder/fxorder.service';
import { Resp } from 'src/app/models/resp';
import { FxorderDialogComponent } from './fxorder-dialog/fxorder-dialog.component';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { FxorderUpdateDialogComponent } from './fxorder-update-dialog/fxorder-update-dialog.component';
import { take } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth/auth.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { formatDate } from '@angular/common';

@Component({
  selector: 'app-fxorder',
  templateUrl: './fxorder.component.html',
  styleUrls: ['./fxorder.component.scss']
})
export class FxorderComponent implements OnInit, OnDestroy {
  fxorders: Fxorder[] = [];
  filteredFxOrders: Fxorder[] = [];
  bsModalRef: BsModalRef;
  config = {
    backdrop: true,
    ignoreBackdropClick: true
  };
  subscriptions: any;
  messages: string[] = [];
  selectedPair: number;

  selectedOrders: any = [];
  selectAllCheckboxes = false;

  orderDateFilter: FormGroup;
  maxDate = new Date();

  constructor(
    private fb: FormBuilder,
    private fxorderService: FxorderService,
    private modalService: BsModalService,
    private toastr: ToastrService,
    private authService: AuthService,
    private router: Router,
    private elem: ElementRef
    ) {}

  ngOnInit() {
    if (this.authService.user === null) {
      this.router.navigate(['/']);
    }

    this.getData();
    this.initOrderDateFilter();
  }

  initOrderDateFilter() {
    const selectedDay = new Date();

    if (selectedDay.getDay() === 6) {
      selectedDay.setDate(selectedDay.getDate() - 1);
    } else if (selectedDay.getDay() === 0) {
      selectedDay.setDate(selectedDay.getDate() - 2);
    }

    this.orderDateFilter = this.fb.group({
      from: this.fb.control(selectedDay, Validators.required),
      to: this.fb.control(selectedDay, Validators.required),
    });
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  updateOrderDateFilter() {
    this.filteredFxOrders = this.fxorders.filter((order, index, array) => {
      // Get From Date
      const fromDate = this.orderDateFilter.value.from;
      fromDate.setHours(0);
      fromDate.setMinutes(0);
      fromDate.setSeconds(0);

      // Get To Date
      const toDate = this.orderDateFilter.value.to;
      toDate.setHours(0);
      toDate.setMinutes(0);
      toDate.setSeconds(0);

      // Get Order Date
      const orderDate = new Date(order.fxOrderUIs[0].orderDate);
      orderDate.setHours(0);
      orderDate.setMinutes(0);
      orderDate.setSeconds(0);

      if (fromDate <= orderDate && orderDate <= toDate) {
        return true;
      } else {
        return false;
      }
    });
  }

  getData() {
    this.subscriptions = this.fxorderService.getAll().subscribe((resp: Resp<Fxorder[]>) => {
      this.fxorders = resp.data;
      this.updateOrderDateFilter();
      // this.getData();
      // console.log(resp.data);
      // setTimeout(() => {
      //   this.getData();
      // }, 5000);
    },
    error => {
      this.authService.logout();
      this.router.navigate(['/']);
    }
    );
  }

  add() {
    this.bsModalRef = this.modalService.show(FxorderDialogComponent, this.config);
    this.bsModalRef.content.closeBtnName = 'Close';

    this.modalService.onHide
    .pipe(take(1))
    .subscribe(() => {
      this.notification( this.bsModalRef.content.fxOrderNotification );
    });
  }

  edit(data: any) {
    this.bsModalRef  = this.modalService.show(FxorderUpdateDialogComponent, this.config);
    this.bsModalRef.content.editData = data;

    this.modalService.onHide
    .pipe(take(1))
    .subscribe(() => {
      if (this.bsModalRef.content.fxOrderNotification) {
        this.notification(this.bsModalRef.content.fxOrderNotification);
      }
    });
  }

  delete(id: number) {
    this.fxorderService.delete(id).subscribe((resp: Resp<boolean>) => {
      if (resp && resp.data) {
        this.notification(resp);
      }
    });
  }

  notification(data) {
    if (data === undefined) {
      return 0;
    }
    // console.log(data);
    this.getData();
    this.toastr.success('', data.message, {
      positionClass : 'toast-bottom-right'
    });
  }

  toggleSelectOrder(id: number) {
    const index = this.selectedOrders.findIndex(item => item === id);
    if (index >= 0) {
      this.selectedOrders.splice(index, 1);
    } else {
      this.selectedOrders.push(id);
    }

    if (this.selectedOrders.length === 0) {
      this.selectAllCheckboxes = false;
    } else {
      this.selectAllCheckboxes = true;
    }
  }

  getSelectedOrders(): number {
    return this.selectedOrders.length;
  }

  deleteRecords() {
    // console.log(this.selectedOrders);
    // return;

    this.selectedOrders.forEach((id: any) => {
      this.delete(id);
    });
    this.selectedOrders = [];
  }

  toggleAllCheckboxes(status: boolean) {
    for (const order of this.elem.nativeElement.querySelectorAll('.activeCheckbox')) {
      order.checked = status;
      this.toggleSelectOrder(parseInt(order.value, 0));
    }
    this.selectAllCheckboxes = status;

    if (status === false) {
      this.selectedOrders = [];
    }
  }

  reloadData() {
    this.subscriptions = this.fxorderService.getAll().subscribe((resp: Resp<Fxorder[]>) => {
      this.fxorders = resp.data;
      this.toastr.success('Data Reload Successfully.', 'Success', {
        positionClass : 'toast-bottom-right'
      });
    },
    error => {
      this.authService.logout();
      this.router.navigate(['/']);
    }
    );
  }

  dateFormat(date: Date, time: Date, zone: string, timeOut = 0, format = 'date', addDays = 0): any {
    switch (zone) {
      case 'EST' : {
        zone = 'UTC-4';
        break;
      }
      case 'IST' : {
        zone = 'UTC+5:30';
        break;
      }
      case 'SGT' : {
        zone = 'UTC+8';
        break;
      }
      default : {
        zone = 'UTC';
      }
    }

    const output  = new Date( formatDate( new Date(
        date.getFullYear(), date.getMonth(), date.getDate(), time.getHours(), time.getMinutes(), time.getSeconds(), 0),
        'MM/dd/yy hh:mm:ss a',
        'en-US',
        'UTC+5:30'
      ) + ' ' + zone);

    output.setFullYear(date.getFullYear());
    output.setMonth(date.getMonth());
    output.setDate(date.getDate() + addDays);
    output.setMinutes(output.getMinutes() + timeOut);

    if (format === 'string') {
      return output.toISOString();
    } else if (format === 'date') {
      return output;
    }
  }
}
