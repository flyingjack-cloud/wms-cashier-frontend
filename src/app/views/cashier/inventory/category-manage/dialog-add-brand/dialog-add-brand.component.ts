import { Component } from '@angular/core';
import {
  MatDialogActions,
  MatDialogClose,
  MatDialogRef
} from "@angular/material/dialog";
import {FormControl, ReactiveFormsModule, Validators} from "@angular/forms";
import {MatInputModule} from "@angular/material/input";
import {MatButtonModule} from "@angular/material/button";
import {CategoryService} from "../../../../../services/category.service";
import {finalize} from "rxjs";
import {MatProgressBarModule} from "@angular/material/progress-bar";
import {ToastService} from "../../../../../services/toast.service";

@Component({
  selector: 'app-dialog-add-brand',
  standalone: true,
  imports: [
    MatInputModule,
    ReactiveFormsModule,
    MatDialogActions,
    MatButtonModule,
    MatDialogClose,
    MatProgressBarModule
  ],
  templateUrl: './dialog-add-brand.component.html',
  styleUrl: './dialog-add-brand.component.scss'
})
export class DialogAddBrandComponent {
  brandName = new FormControl('', [Validators.required]);

  loading:boolean = false;

  constructor(private categoryService:CategoryService,
              private dialogRef: MatDialogRef<DialogAddBrandComponent>,
              private toast: ToastService) {
  }

  submit (){
    this.loading = true;
    this.categoryService.insertCategory(0, this.brandName.value!).pipe(
        finalize(() => {
          this.loading = false;// 请求完成后重新显示button
          this.dialogRef.close();
        } )
    ).subscribe({
      complete: () => this.toast.push("添加成功", "success")
    });
  }
}
