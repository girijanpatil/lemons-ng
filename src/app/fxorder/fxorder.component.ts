import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Fxorder } from 'src/app/models/fxorder';
import { FxorderService } from 'src/app/services/fxorder/fxorder.service';
import { Resp } from 'src/app/models/resp';
import { FxorderDialogComponent } from './fxorder-dialog/fxorder-dialog.component';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { FxorderUpdateDialogComponent } from './fxorder-update-dialog/fxorder-update-dialog.component';
import { Subscription } from 'rxjs';
import { take } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-fxorder',
  templateUrl: './fxorder.component.html',
  styleUrls: ['./fxorder.component.scss']
})
export class FxorderComponent implements OnInit {
  fxorders: Fxorder[] = [];
  bsModalRef: BsModalRef;
  config = {
    backdrop: true,
    ignoreBackdropClick: true
  };
  subscriptions: Subscription[] = [];
  messages: string[] = [];

  constructor(
    private fxorderService: FxorderService, 
    private modalService: BsModalService,
    private toastr: ToastrService
    ) {
    this.getData();
  }

  ngOnInit() {}

  getData() {
    this.fxorderService.getAll().subscribe((resp: Resp<Fxorder[]>) => {
      this.fxorders = resp.data;
      console.log(resp.data);
    });
  }

  add() {
    this.bsModalRef = this.modalService.show(FxorderDialogComponent, this.config);
    this.bsModalRef.content.closeBtnName = 'Close';

    this.modalService.onHide
    .pipe(take(1))
    .subscribe(() => {
      this.notification(this.bsModalRef.content.fxOrderNotification)
    });
  }

  edit(data: any) {
    this.bsModalRef  = this.modalService.show(FxorderUpdateDialogComponent, this.config);
    this.bsModalRef.content.editData = data;

    this.modalService.onHide
    .pipe(take(1))
    .subscribe(() => {
      if(this.bsModalRef.content.fxOrderNotification)
        this.notification(this.bsModalRef.content.fxOrderNotification)
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
    if(data===undefined)
    return 0;
    console.log(data);
    this.getData();
    this.toastr.success('', data.message, {
      'positionClass' : 'toast-bottom-right'
    });
  }
}
