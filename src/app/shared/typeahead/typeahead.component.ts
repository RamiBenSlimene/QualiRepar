import { Component, Input, Output, EventEmitter } from '@angular/core';
import type { OnInit } from '@angular/core';
import { Item } from 'src/app/types/types';

@Component({
  selector: 'app-typeahead',
  templateUrl: 'typeahead.component.html',
})
export class TypeaheadComponent implements OnInit {
  @Input() items: Item[] = [];
  @Input() selectedItems: string[] = [];
  @Input() title = 'Select Items';
  @Output() selectionCancel = new EventEmitter<void>();
  @Output() selectionChange = new EventEmitter<string>();
  selectedItem: any;
  filteredItems: Item[] = [];
  workingSelectedValues: string[] = [];

  ngOnInit() {
    this.filteredItems = [...this.items];
    this.workingSelectedValues = [...this.selectedItems];
  }

  trackItems(index: number, item: Item) {
    return item.value;
  }

  cancelChanges() {
    this.selectionCancel.emit();
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

    // If using single-select, update the selected item based on the filtering
    if (this.filteredItems.length > 0) {
      this.selectedItem = this.filteredItems[0].value;
    } else {
      // Handle case when no items match the search query
      this.selectedItem = null; // or any default value
    }
  }


  isChecked(value: string) {
    return this.workingSelectedValues.find((item) => item === value);
  }

  radioChange(event: any) {
    const { value } = event.detail;

    // Update the selected value
    this.selectedItem = value;

    // Handle the selected item change here
    this.selectionChange.emit(this.selectedItem);

  }

}
