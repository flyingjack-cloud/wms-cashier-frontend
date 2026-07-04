import {AfterViewInit, Component, inject} from '@angular/core';
import {MatTabsModule} from "@angular/material/tabs";
import {MatListModule} from "@angular/material/list";
import {MatIconModule} from "@angular/material/icon";
import {UserService} from "../../../services/user.service";
import {UserProfile} from "../../../models/profile";
import {Observable} from "rxjs";
import {AsyncPipe} from "@angular/common";
import {Router, RouterLink, RouterOutlet} from "@angular/router";

@Component({
  selector: 'app-personal-center',
  standalone: true,
  imports: [
    MatTabsModule,
    MatListModule,
    MatIconModule,
    AsyncPipe,
    RouterOutlet,
    RouterLink
  ],
  templateUrl: './personal-center.component.html',
  styleUrl: './personal-center.component.scss'
})
export class PersonalCenterComponent implements AfterViewInit{
  private userService = inject(UserService);
  private router = inject(Router);
  profile: Observable<UserProfile> = this.userService.getProfile();

  constructor() {
    this.userService.refreshProfile();
  }

  ngAfterViewInit() {
    if (this.router.url ==  "/cashier/center") {
      this.router.navigate(["/cashier/center/profile"]);
    }
  }
}
