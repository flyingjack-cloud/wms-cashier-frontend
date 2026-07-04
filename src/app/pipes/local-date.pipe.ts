import {DatePipe} from "@angular/common";
import {Pipe, PipeTransform} from "@angular/core";

function displayTimeZone(): string | undefined {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone ? undefined : "+0800";
  } catch {
    return "+0800";
  }
}

@Pipe({
  name: "localDate",
  standalone: true,
})
export class LocalDatePipe implements PipeTransform {
  private readonly datePipe = new DatePipe("en-US");

  transform(value: Date | string | number | null | undefined, format: string = "yyyy-MM-dd HH:mm:ss"): string | null {
    return this.datePipe.transform(value, format, displayTimeZone());
  }
}
