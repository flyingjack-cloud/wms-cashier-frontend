import {CommonModule} from '@angular/common';
import {Component, inject, Inject, OnInit, ViewChild} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {MatIconModule} from '@angular/material/icon';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatDividerModule} from '@angular/material/divider';
import {MatButtonModule} from '@angular/material/button';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {MatNativeDateModule} from '@angular/material/core';
import {OrderService} from "../../../../services/order.service";
import {MatProgressSpinnerModule} from "@angular/material/progress-spinner";
import {MatProgressBarModule} from "@angular/material/progress-bar";
import {finalize} from "rxjs";
import {ToastService} from "../../../../services/toast.service";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {Order} from "../../../../models/order";
import {NgxPrintModule} from "ngx-print";
import {ReceiptPrintComponent} from "../../../components/receipt/receipt-print.component";
import {MatSlideToggleModule} from '@angular/material/slide-toggle';
import { CustomerDetail } from 'src/app/models/customer';

interface OrderConfirmForm {
  date: FormControl<Date>;
  remark: FormControl<string>;
}

@Component({
  selector: 'app-order-confirm',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, MatFormFieldModule, NgxPrintModule,
    MatInputModule, MatIconModule, MatDividerModule, MatButtonModule, MatSlideToggleModule,
    MatDatepickerModule, MatNativeDateModule, MatProgressSpinnerModule, MatProgressBarModule, ReceiptPrintComponent],
  providers:[

    ],
  templateUrl: './order-confirm.component.html',
  styleUrl: './order-confirm.component.scss'
})
export class OrderConfirmComponent implements OnInit{
  private formBuilder = inject(FormBuilder);
  totalSellingPrice: number = 0;
  today = new Date();
  loading:boolean = false; // 用于请求时控制允许提交

  @ViewChild("receipt") receipt!: ReceiptPrintComponent;

  orderConfirmForm:FormGroup<OrderConfirmForm> = this.formBuilder.nonNullable.group(
    {
      date: [this.today, Validators.required],
      remark: [''],
    });

  detailRequired:boolean = false;
  customerDetail: CustomerDetail = {
    name: "",
    phone: "",
    address: ""
  }

  constructor(@Inject(MAT_DIALOG_DATA) public data: { cart: Order[]},
              private dialogRef: MatDialogRef<OrderConfirmComponent>,
              private orderService:OrderService,
              private toast: ToastService) {}

  ngOnInit(): void {
    this.data.cart.forEach((item: Order) => {
      this.totalSellingPrice += item.sellingPrice;
    });
  }

  /**
   * 提交订单
   */
  order() {
    if (this.loading) {
      return;
    }

    if (this.orderConfirmForm.invalid || this.data.cart.length == 0) {
      this.orderConfirmForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    let orders: Order[] = [];

    this.data.cart.forEach(or => orders.push({
      id: -1,
      merchandise: or.merchandise,
      sellingPrice: or.sellingPrice,
      remark: this.orderConfirmForm.value.remark!,
      sellingTime: this.orderConfirmForm.value.date!,
      returned: false
    }));

    console.log("提交订单", orders);

    this.receipt.data = orders;

    if(this.detailRequired){
      this.receipt.customerDetail = this.customerDetail;
    }

    this.orderService.batchOrder(orders).pipe(
      finalize(() => this.loading = false)
    ).subscribe({
      next: () => {
        this.toast.push("提交成功", "success");
        this.dialogRef.close({isSuccess: true});
        this.receipt.print();
      }
    });
  }
}
