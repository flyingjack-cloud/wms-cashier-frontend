import {Component, inject} from '@angular/core';
import {MatButtonModule} from "@angular/material/button";
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent, MatDialogRef,
  MatDialogTitle
} from "@angular/material/dialog";
import {MatProgressBarModule} from "@angular/material/progress-bar";
import {Merchandise} from "../../../../models/merchandise";
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {MatInputModule} from "@angular/material/input";
import {MatListModule} from "@angular/material/list";
import {MerchandiseService} from "../../../../services/merchandise.service";
import {finalize} from "rxjs";
import {ToastService} from "../../../../services/toast.service";

interface MerchandiseEditForm {
  cost: FormControl<number>;
  price: FormControl<number>;
  imei: FormControl<string>;
}
@Component({
  selector: 'app-dialog-edit-component',
  standalone: true,
  imports: [
    MatButtonModule,
    MatDialogActions,
    MatDialogClose,
    MatDialogContent,
    MatDialogTitle,
    MatProgressBarModule,
    ReactiveFormsModule,
    MatInputModule,
    MatListModule
  ],
  templateUrl: './dialog-edit.component.html',
  styleUrl: './dialog-edit.component.scss'
})
export class DialogEditComponent {
  data = inject<Merchandise>(MAT_DIALOG_DATA);
  loading:boolean = false;
  form = new FormGroup<MerchandiseEditForm>({
    cost: new FormControl(this.data.cost, {nonNullable: true, validators:[Validators.required, Validators.min(1), Validators.max(999999)]}),
    price: new FormControl(this.data.price, {nonNullable: true, validators:[Validators.required, Validators.min(1), Validators.max(999999)]}),
    imei: new FormControl(this.data.imei, {nonNullable: true, validators:[Validators.required]}),
  });

  constructor(private dialogRef: MatDialogRef<DialogEditComponent>,
              private service: MerchandiseService,
              private toast: ToastService) {
  }

  onSubmit(){
    this.loading = true;
    if (this.form.valid) {
      this.service.updateMerchandise(this.data.id, this.form.value.cost!, this.form.value.price!, this.form.value.imei!).pipe(
        finalize(()=> this.loading = false)
      ).subscribe({
          complete: () => {
            this.toast.push("修改成功", "success");
            this.dialogRef.close({ data: this.data});
          }
        });
    }
    else {
      this.loading = false;
    }
  }
}
