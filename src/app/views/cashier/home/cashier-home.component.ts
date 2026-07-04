import {Component, OnInit} from '@angular/core';
import {MatListModule} from "@angular/material/list";
import {MatCardModule} from "@angular/material/card";
import {MatIconModule} from "@angular/material/icon";
import {NoticeService} from "../../../services/notice.service";
import {Notice} from "../../../models/notice";
import {LocalDatePipe} from "../../../pipes/local-date.pipe";


@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    LocalDatePipe,
    MatListModule,
    MatCardModule,
    MatIconModule
  ],
  templateUrl: './cashier-home.component.html',
  styleUrl: './cashier-home.component.scss'
})
export class CashierHomeComponent implements OnInit{
  today = new Date();

  warnNotice: Notice = {
    id: 1,
    type: "wan",
    publishTime: new Date(),
    content: "无"
  };

  updateNotice: Notice= {
    id: 1,
    type: "update",
    publishTime: new Date(),
    content: "无"
  };

  constructor(public noticeService:NoticeService) {
  }

  ngOnInit(): void {
    this.noticeService.getNotice("warn").subscribe(data => {
      if (data.content && data.content.length > 1) {
        this.warnNotice = data;
      }
    });

    this.noticeService.getNotice("update").subscribe(data => {
      if (data.content && data.content.length > 1) {
        this.updateNotice = data;
      }
    });
  }

}
