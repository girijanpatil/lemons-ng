import { Component, OnInit, Inject, TemplateRef } from '@angular/core';
import { FxorderService } from 'src/app/services/fxorder/fxorder.service';
import { AccountService } from 'src/app/services/account/account.service';
import { BrokerService } from 'src/app/services/broker/broker.service';
import { CurrencyService } from 'src/app/services/currency/currency.service';
import { SecurityMasterService } from 'src/app/services/securitymaster/securitymaster.service';
import { TenorService } from 'src/app/services/tenor/tenor.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Fxorder } from 'src/app/models/fxorder';
import { Resp } from 'src/app/models/resp';
import { forkJoin } from 'rxjs';
import { Broker } from 'src/app/models/broker';
import { Currency } from 'src/app/models/currency';
import { SecurityMaster } from 'src/app/models/securitymaster';
import { Tenor } from 'src/app/models/tenor';

import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';

@Component({
  selector: 'app-fxorder-dialog',
  templateUrl: './fxorder-dialog.component.html',
  styleUrls: ['./fxorder-dialog.component.scss']
})
export class FxorderDialogComponent implements OnInit {

  fxorderFirstForm: FormGroup;
  fxorderThenForm: FormGroup;

  accounts: Account[];
  brokers: Broker[];
  currencies: Currency[];
  securities: SecurityMaster[];
  tenors: Tenor[];

  isProcessing          = false;
  firstFormDealtCcyName = "XXX";
  thenFormDealtCcyName  = "XXX";

  fxOrderNotification: any;

  constructor(
    private fb: FormBuilder, 
    private fxorderService: FxorderService,
    private accountService: AccountService, 
    private brokerService: BrokerService,
    private currencyService: CurrencyService, 
    private securityMasterService: SecurityMasterService,
    private tenorService: TenorService,
    private modalRef: BsModalRef,
    private modalService: BsModalService
    ) {
    this.getData();
    this.formInit();
  }

  ngOnInit() {}

  formInit() {
    this.fxorderFirstForm = this.fb.group({
      // id: this.fb.control(0, Validators.required),
      accountId: this.fb.control(null, Validators.required),
      assetClass: this.fb.control("FX", Validators.required),
      brokerId: this.fb.control(null, Validators.required),
      dealtCcyId: this.fb.control(0, Validators.required),
      direction: this.fb.control("BUY", Validators.required),
      notional: this.fb.control(null, Validators.required),
      orderDate: this.fb.control(new Date(), Validators.required),
      price: this.fb.control(null, Validators.required),
      securityId: this.fb.control(null, Validators.required),
      settlementDate: this.fb.control(null, Validators.required),
      tenorId: this.fb.control(null, Validators.required),
      validFrom: this.fb.control(new Date(), Validators.required),
      validTill: this.fb.control(null, Validators.required),
    });

    this.fxorderThenForm = this.fb.group({
      // id: this.fb.control(0, Validators.required),
      accountId: this.fb.control(null, Validators.required),
      assetClass: this.fb.control("FX", Validators.required),
      brokerId: this.fb.control(null, Validators.required),
      dealtCcyId: this.fb.control(0, Validators.required),
      direction: this.fb.control("SELL", Validators.required),
      notional: this.fb.control(null, Validators.required),
      orderDate: this.fb.control(new Date(), Validators.required),
      price: this.fb.control(null, Validators.required),
      securityId: this.fb.control(null, Validators.required),
      settlementDate: this.fb.control(null, Validators.required),
      tenorId: this.fb.control(null, Validators.required),
      validFrom: this.fb.control(new Date(), Validators.required),
      validTill: this.fb.control(null, Validators.required)
    });
  }

  getData() {
    const accountReq = this.accountService.getAll();
    const brokerReq = this.brokerService.getAll();
    const currencyReq = this.currencyService.getAll();
    const securityReq = this.securityMasterService.getAll();
    const tenorReq = this.tenorService.getAll();

    forkJoin([accountReq, brokerReq, currencyReq, securityReq, tenorReq]).subscribe((resp: any) => {
      this.accounts = resp[0].data;
      this.brokers = resp[1].data;
      this.currencies = resp[2].data;
      this.securities = resp[3].data;
      this.tenors = resp[4].data;
    });
  }

  toggleBuySell() {
    if(this.fxorderFirstForm.value.direction=="BUY")
      this.fxorderFirstForm.controls['direction'].setValue("SELL");
    else
      this.fxorderFirstForm.controls['direction'].setValue("BUY");

    if(this.fxorderThenForm.value.direction=="BUY")
      this.fxorderThenForm.controls['direction'].setValue("SELL");
    else
      this.fxorderThenForm.controls['direction'].setValue("BUY");
  }

  onCurrencyChange(securityId: number, status: boolean) {
    const security = this.securities.find(s => s.id == securityId);
    const dealtCcyId = security.primaryCcy.id;
    const dealtCcyCode = security.primaryCcy.code;

    if(status) {
      this.fxorderFirstForm.patchValue({
        dealtCcyId
      });

      this.fxorderThenForm.patchValue({
        securityId,
        dealtCcyId
      });

      this.firstFormDealtCcyName = dealtCcyCode;
      this.thenFormDealtCcyName = dealtCcyCode;
    }else{
      this.fxorderThenForm.patchValue({
        dealtCcyId
      });

      this.thenFormDealtCcyName = dealtCcyCode;
    }
  }

  onNotionalChange(value: any, status: boolean) {
    if(value.length > 0) {
      let startValue    = value.substring(0, value.length-1);
      const lastLetter  = (value.slice(-1)).toUpperCase();
      let multiplyBy    = 0;
      let notional: any;

      if(isNaN(value)){
        if(lastLetter == "K") {
          multiplyBy = 1000;
        }else if(lastLetter == "M") {
          multiplyBy = 1000000;
        }else if(lastLetter == "B") {
          multiplyBy = 1000000000;
        }
  
        if(!isNaN(startValue)){
          notional = startValue*multiplyBy;
        }
      }else {
        notional = value;
      }

      if (status) {
        this.fxorderFirstForm.patchValue({
          notional
        });

        this.fxorderThenForm.patchValue({
          notional
        });
      }else {
        this.fxorderThenForm.patchValue({
          notional
        });
      }
    }
  }

  onTenorChange(value: number, status: boolean) {
    const tenor           = this.tenors.find(f => f.id == value);
    const tenorId         = tenor.id;
    const validFrom       = new Date();
    const validTill       = new Date(new Date().setDate(validFrom.getDate() + tenor.fwdDays));
    const settlementDate  = validTill;

    
    if (status) {
      this.fxorderFirstForm.patchValue({
        settlementDate,
        validFrom,
        validTill
      });

      this.fxorderThenForm.patchValue({
        tenorId,
        settlementDate,
        validFrom,
        validTill
      });
    } else {
      this.fxorderThenForm.patchValue({
        settlementDate,
        validFrom,
        validTill
      });
    }
  }

  onSettlementDateChange(settlementDate: string, status: boolean)
  {
    const validTill = settlementDate;

    if (status) {
      this.fxorderFirstForm.patchValue({
        validTill
      });

      this.fxorderThenForm.patchValue({
        settlementDate,
        validTill
      });
    } else {
      this.fxorderThenForm.patchValue({
        validTill
      });
    }
  }

  onAccountChange(accountId: number) {
    this.fxorderThenForm.patchValue({
      accountId
    });
  }

  onBrokerChange(brokerId: number) {
    this.fxorderThenForm.patchValue({
      brokerId
    });
  }

  save() {
    if (!this.isProcessing) {
      this.isProcessing = true;
      const firstModel  = this.fxorderFirstForm.value;
      const thenModel   = this.fxorderThenForm.value;

      firstModel.accountId    = parseInt(firstModel.accountId.toString());
      thenModel.accountId     = parseInt(thenModel.accountId.toString());

      firstModel.brokerId     = parseInt(firstModel.brokerId.toString());
      thenModel.brokerId      = parseInt(thenModel.brokerId.toString());

      firstModel.notional     = parseFloat(firstModel.notional.toString());
      thenModel.notional      = parseFloat(thenModel.notional.toString());

      firstModel.price        = parseFloat(firstModel.price.toString());
      thenModel.price         = parseFloat(thenModel.price.toString());

      firstModel.securityId   = parseInt(firstModel.securityId.toString());
      thenModel.securityId    = parseInt(thenModel.securityId.toString());

      firstModel.tenorId      = parseInt(firstModel.tenorId.toString());
      thenModel.tenorId       = parseInt(thenModel.tenorId.toString());

      const model = [firstModel, thenModel];

      this.fxorderService.save(model).subscribe((resp: Resp<Fxorder>) => {
        this.fxOrderNotification = resp;
        this.close();
      });
    }
  }

  close() {
    this.modalRef.hide();
  }
}
