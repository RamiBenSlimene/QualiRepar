import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { Item } from 'src/app/types/types';

@Component({
  selector: 'app-ag-single-select',
  templateUrl: './ag-single-select.component.html',
  styleUrls: ['./ag-single-select.component.scss'],

})
export class AgSingleSelectComponent implements OnInit, OnChanges {
  ngOnChanges(changes: SimpleChanges): void {
    this.filteredItems = [...this.items];
  }
  @Input() items: Item[] = [];
  @Input() selectedItems!: Item;
  @Input() title = 'Select Items';
  @Output() selectionCancel = new EventEmitter<void>();
  @Output() selectionChange = new EventEmitter<Item>();

  filteredItems: Item[] = [];

  ngOnInit() {
    this.filteredItems = [...this.items];
  }

  trackItems(index: number, item: Item) {
    return item.value;
  }

  cancelChanges() {
    this.selectionCancel.emit();
  }

  confirmChanges() {
    this.selectionChange.emit(this.selectedItems);
  }

  searchbarInput(ev: any) {
    this.filterList(ev.target.value);
  }

  /**
   * Update the rendered view with
   * the provided search query. If no
   * query is provided, all data
   * will be rendered.
   */
  filterList(searchQuery: string | undefined) {
    /**
     * If no search query is defined,
     * return all options.
     */
    if (searchQuery === undefined) {
      this.filteredItems = [...this.items];
    } else {
      /**
       * Otherwise, normalize the search
       * query and check to see which items
       * contain the search query as a substring.
       */
      const normalizedQuery = searchQuery.toLowerCase();
      this.filteredItems = this.items.filter((item) => {
        return item.text.toLowerCase().includes(normalizedQuery);
      });
    }
  }

  isChecked(item: Item) {
    return this.selectedItems.value === item.value;
  }

  checkboxChange(ev: { detail: { value: Item; }; }) {
    this.selectedItems = ev.detail.value;
    this.selectionChange.emit(this.selectedItems);

  }
}
