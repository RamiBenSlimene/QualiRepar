import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { tap, catchError, of } from 'rxjs';
import { EcoSupportService } from 'src/app/services/eco-support.service';
import { ApiResponse } from 'src/app/types/api-response';
import { Brands } from 'src/app/types/brand';
import { ProductTypes } from 'src/app/types/product-type';

@Component({
  selector: 'app-ag-filter',
  templateUrl: './ag-filter.component.html',
  styleUrls: ['./ag-filter.component.scss'],
})
export class AgFilterComponent {
  form!: FormGroup;
  submitted: boolean = false;
  loading: boolean = false;
  loading_page: boolean = false;
  productTypeList: ProductTypes = [];
  brandList: Brands = [];
  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly ecoSupportService: EcoSupportService
  ) {
    this.form = this.formBuilder.group({
      brandId: ['', Validators.required],
      productId: ['', Validators.required],
    });

    this.ecoSupportService
      .getBrandList()
      .pipe(
        tap((response: ApiResponse<Brands> | null) => {
          if (response) {
            this.brandList = response.ResponseData;
          }
        })
      )
      .subscribe();

    this.ecoSupportService
      .getProductTypeList()
      .pipe(
        tap((response: ApiResponse<ProductTypes> | null) => {
          if (response) {
            this.productTypeList = response.ResponseData;
          }
        })
      )
      .subscribe();
  }

  onSubmit() {}
}
