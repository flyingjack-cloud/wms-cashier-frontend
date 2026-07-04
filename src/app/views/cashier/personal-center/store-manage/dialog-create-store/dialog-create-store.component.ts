import {Component} from '@angular/core';
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {MatInputModule} from "@angular/material/input";
import {MatButtonModule} from "@angular/material/button";
import {MatDialogClose, MatDialogRef} from "@angular/material/dialog";
import {GroupService} from "../../../../../services/group.service";
import {ToastService} from "../../../../../services/toast.service";

interface StoreCreateForm {
  storeName: FormControl<string>;
  address: FormControl<string | null>;
  contact: FormControl<string | null>;
  createTime: FormControl<Date>;
}

@Component({
  selector: 'app-dialog-create-store',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatInputModule,
    MatButtonModule,
    MatDialogClose
  ],
  templateUrl: './dialog-create-store.component.html',
  styleUrl: './dialog-create-store.component.scss'
})
export class DialogCreateStoreComponent {
  form = new FormGroup<StoreCreateForm>({
    storeName: new FormControl<string>('', {nonNullable: true, validators: [Validators.required, Validators.minLength(3), Validators.maxLength(30) ]}),
    address: new FormControl('', { validators: [ Validators.maxLength(200) ]}),
    contact: new FormControl('', { validators: [ Validators.maxLength(200) ]}),
    createTime: new FormControl<Date>(new Date(), { nonNullable: true}),
  });

  constructor(private groupService: GroupService, private toast: ToastService, public dialogRef: MatDialogRef<DialogCreateStoreComponent>) {
  }

  submit() {
    if (this.form.valid) {
      this.groupService.createGroup(this.form.value.storeName!, this.form.value.address!,
        this.form.value.contact!, this.form.value.createTime!).subscribe({
        complete: () => {
          this.toast.push("创建成功", "success");
          this.dialogRef.close();
        }
      });
    }
  }
}
