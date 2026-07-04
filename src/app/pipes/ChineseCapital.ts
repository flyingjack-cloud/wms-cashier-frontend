import {Pipe, PipeTransform} from "@angular/core";

@Pipe({standalone: true, name: "chinese_capital"})
export class ChineseCapitalPipe implements PipeTransform {
  digitMap = ['零', '壹', '贰', '叁', '肆', '伍', '陆', '柒', '捌', '玖', '拾'];
  unitMap = ['', '拾', '佰', '仟', '万', '拾', '佰', '仟', '亿', '拾', '佰', '仟'];

  transform(value: any, ...args: any[]): any {
    let result = this.numToCapital(value, 0);
    return result;
  }

  numToCapital(num: number, digit: number): string {
    if (num < 10){
      return this.digitMap[num] + this.unitMap[digit];
    }

    return this.numToCapital(Math.floor(num/10), digit + 1) + this.digitMap[num % 10] + this.unitMap[digit];
  }
}
