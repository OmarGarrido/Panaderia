import {
  Directive,
  ElementRef,
  HostListener,
  Input,
  Renderer2,
} from '@angular/core';
import { Soxrt } from '../util/sort';

@Directive({
  selector: '[appSort]',
})
export class SortDirective {
  @Input() appSort: any;
  constructor(private targetElem: ElementRef) {}

  @HostListener('click')
  sortData() {
    const sort = new Soxrt();
    //Get reference of current clicked element
    const elem = this.targetElem.nativeElement;
    //getin which orderlistashould be sorted by default it should be set to desc on element atribute
    const order = elem.getAttribute('data-order');
    //get the property type specially set [data-type=date] if it is date field
    const type = elem.getAttribute('data-type');
    //get property name from element atribute
    const property = elem.getAttribute('date-name');

    if (order === 'desc') {
      console.log('desc',this.appSort);

      this.appSort.sort(sort.startSort(property, order, type));
      elem.setAttribute('data-order', 'asc');
    } else {
      console.log(this.appSort);
      this.appSort.sort(sort.startSort(property, order, type));
      elem.setAttribute('data-order', 'desc');
    }
  }
}
