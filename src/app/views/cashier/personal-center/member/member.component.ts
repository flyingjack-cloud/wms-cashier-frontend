import { Component } from '@angular/core';
import {MatInputModule} from "@angular/material/input";

@Component({
  selector: 'app-member',
  standalone: true,
  imports: [
    MatInputModule
  ],
  templateUrl: './member.component.html',
  styleUrl: './member.component.scss'
})
export class MemberComponent {

}
