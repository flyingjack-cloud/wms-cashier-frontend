import {Component, Inject} from '@angular/core';
import {MatButtonModule} from "@angular/material/button";
import {MAT_DIALOG_DATA, MatDialogActions, MatDialogClose, MatDialogRef} from "@angular/material/dialog";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatInputModule} from "@angular/material/input";
import {MatProgressBarModule} from "@angular/material/progress-bar";
import {FormControl, ReactiveFormsModule, Validators} from "@angular/forms";
import {Category} from "../../../../../models/category";
import {finalize} from "rxjs";
import {CategoryService} from "../../../../../services/category.service";
import {ToastService} from "../../../../../services/toast.service";

@Component({
  selector: 'app-dialog-add-model',
  standalone: true,
  imports: [
    MatButtonModule,
    MatDialogActions,
    MatDialogClose,
    MatFormFieldModule,
    MatInputModule,
    MatProgressBarModule,
    ReactiveFormsModule
  ],
  templateUrl: './dialog-add-model.component.html',
  styleUrl: './dialog-add-model.component.scss'
})
export class DialogAddModelComponent {
  modelName = new FormControl('', [Validators.required]);
  loading:boolean = false;

  constructor(@Inject(MAT_DIALOG_DATA) public data: Category,
              private categoryService: CategoryService,
              private dialogRef: MatDialogRef<DialogAddModelComponent>,
              private toast: ToastService) {
  }
  submit() {
    this.loading = true;
    this.categoryService.insertCategory(this.data.id, this.modelName.value!).pipe(
      finalize(() => {
        this.loading = false;// 请求完成后重新显示button
        this.dialogRef.close();
      } )
    ).subscribe({
      complete: () => this.toast.push("添加成功", "success")
    });
  }
}
