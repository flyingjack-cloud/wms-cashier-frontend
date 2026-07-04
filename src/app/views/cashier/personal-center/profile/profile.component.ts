import {Component, inject} from '@angular/core';
import {UserProfile} from "../../../../models/profile";
import {Observable} from "rxjs";
import {UserService} from "../../../../services/user.service";
import {ReactiveFormsModule} from "@angular/forms";
import {AsyncPipe} from "@angular/common";
import {MatButtonModule} from "@angular/material/button";
import {MatIconModule} from "@angular/material/icon";
import {MatInputModule} from "@angular/material/input";
import {MatListModule} from "@angular/material/list";
import {ToastService} from "../../../../services/toast.service";

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    AsyncPipe,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatListModule
  ],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent {
  private userService = inject(UserService);
  private toast = inject(ToastService);
  profile: Observable<UserProfile> = this.userService.getProfile();

  showEditNickname: boolean = false;

  constructor() {
  }

  editNickname(nickname: string) {
      if (nickname == null || nickname == "" || nickname == "未设置") {
        this.toast.push("用户名不能为空或者是'未设置'", "warning");
      } else {
        this.userService.updateNickname(nickname).subscribe({
          complete: () => {
            this.showEditNickname = false; 
            this.userService.refreshProfile(); 
            this.toast.push("修改昵称成功", "success")},
        });
      }
  }
}
