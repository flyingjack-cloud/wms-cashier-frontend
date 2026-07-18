import { CommonModule } from '@angular/common';
import { Component, inject, Inject, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { firstValueFrom, forkJoin } from 'rxjs';
import { OrderService } from '../../../../services/order.service';
import { ToastService } from '../../../../services/toast.service';
import { ReceiptService } from '../../../../services/receipt.service';
import { Order } from '../../../../models/order';
import { OrderExtra, OrderExtraField, OrderExtraTemplate } from '../../../../models/receipt';
import { ReceiptPrintComponent } from '../../../components/receipt/receipt-print.component';

interface OrderConfirmForm {
  date: FormControl<Date>;
  remark: FormControl<string>;
}

@Component({
  selector: 'app-order-confirm',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, FormsModule, MatFormFieldModule, MatInputModule,
    MatButtonModule, MatSlideToggleModule, MatSelectModule, MatCheckboxModule,
    MatDatepickerModule, MatNativeDateModule, MatProgressBarModule, ReceiptPrintComponent,
  ],
  templateUrl: './order-confirm.component.html',
  styleUrl: './order-confirm.component.scss',
})
export class OrderConfirmComponent implements OnInit {
  private formBuilder = inject(FormBuilder);
  totalSellingPrice = 0;
  loading = false;
  templatesLoading = true;
  extraTemplates: OrderExtraTemplate[] = [];
  selectedTemplates: Record<string, boolean> = {};
  extraPayloads: Record<string, Record<string, unknown>> = {};

  @ViewChild('receipt') receipt!: ReceiptPrintComponent;

  orderConfirmForm: FormGroup<OrderConfirmForm> = this.formBuilder.nonNullable.group({
    date: [new Date(), Validators.required],
    remark: [''],
  });

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { cart: Order[] },
    private dialogRef: MatDialogRef<OrderConfirmComponent>,
    private orderService: OrderService,
    private receiptService: ReceiptService,
    private toast: ToastService,
  ) {}

  ngOnInit(): void {
    this.totalSellingPrice = this.data.cart.reduce((sum, item) => sum + item.sellingPrice, 0);
    this.receiptService.getExtraTemplates().subscribe({
      next: templates => {
        this.extraTemplates = templates;
        for (const template of templates) {
          this.selectedTemplates[template.code] = false;
          this.extraPayloads[template.code] = Object.fromEntries(
            template.schema.fields.map(field => [field.key, field.type === 'boolean' ? false : '']),
          );
        }
        this.templatesLoading = false;
      },
      error: () => this.templatesLoading = false,
    });
  }

  fieldLabel(field: OrderExtraField): string {
    return field.label || field.key;
  }

  async order(): Promise<void> {
    if (this.loading) return;
    if (this.orderConfirmForm.invalid || !this.data.cart.length || !this.validateExtras()) {
      this.orderConfirmForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    let created = false;
    const orders: Order[] = this.data.cart.map(item => ({
      id: -1,
      merchandise: item.merchandise,
      sellingPrice: item.sellingPrice,
      remark: this.orderConfirmForm.controls.remark.value,
      sellingTime: this.orderConfirmForm.controls.date.value,
      returned: false,
    }));

    try {
      const ids = await firstValueFrom(this.orderService.batchOrder(orders));
      created = true;
      if (!Array.isArray(ids) || ids.length !== orders.length) throw new Error('订单 ID 数量与请求不一致');
      orders.forEach((order, index) => order.id = ids[index]);

      const selected = this.extraTemplates.filter(template => this.selectedTemplates[template.code]);
      const saves = orders.flatMap(order => selected.map(template =>
        this.receiptService.saveOrderExtra(order.id, template.code, this.payloadFor(template)),
      ));
      if (saves.length) await firstValueFrom(forkJoin(saves));

      const extrasByOrder = new Map<number, OrderExtra[]>();
      for (const order of orders) {
        extrasByOrder.set(order.id, selected.map(template => ({
          orderId: order.id,
          templateCode: template.code,
          templateName: template.name,
          templateVersion: template.version,
          payload: this.payloadFor(template),
        })));
      }
      this.receipt.data = orders;
      this.receipt.extrasByOrder = extrasByOrder;
      await this.receipt.print();
      this.toast.push('提交成功', 'success');
      this.dialogRef.close({ isSuccess: true });
    } catch {
      if (created) {
        this.toast.push('订单已创建，但附加信息或打印未完成，请到历史账单补打', 'warning');
        this.dialogRef.close({ isSuccess: true });
      }
    } finally {
      this.loading = false;
    }
  }

  private validateExtras(): boolean {
    for (const template of this.extraTemplates.filter(item => this.selectedTemplates[item.code])) {
      for (const field of template.schema.fields) {
        const value = this.extraPayloads[template.code][field.key];
        if (field.required && (value == null || value === '')) {
          this.toast.push(`${template.name}：${this.fieldLabel(field)}为必填项`, 'warning');
          return false;
        }
      }
    }
    return true;
  }

  private payloadFor(template: OrderExtraTemplate): Record<string, unknown> {
    return Object.fromEntries(template.schema.fields.flatMap(field => {
      const value = this.extraPayloads[template.code][field.key];
      return value === '' || value == null ? [] : [[field.key, value]];
    }));
  }
}
