import { Component, ViewChild } from '@angular/core';
import { IonModal, ModalController, ToastController } from '@ionic/angular';
import { tap } from 'rxjs';
import { EcoSupportService } from 'src/app/services/eco-support.service';
import { ApiResponse } from 'src/app/types/api-response';
import { Brands } from 'src/app/types/brand';
import { ProductTypes } from 'src/app/types/product-type';
import { Item } from 'src/app/types/types';
import { DataStore } from 'src/app/helpers/data.store';
import { NavigationExtras, Router } from '@angular/router';
import { RoutesPaths } from 'src/app/enums/RoutesPath';
import { InAppBrowser } from '@awesome-cordova-plugins/in-app-browser/ngx';

@Component({
  selector: 'app-calculate-support',
  templateUrl: './calculate-support.component.html',
  styleUrls: ['./calculate-support.component.scss'],
})
export class CalculateSupportComponent {
  @ViewChild('modalBrand', { static: true }) modalBrand!: IonModal;
  @ViewChild('modalProduct', { static: true }) modalProduct!: IonModal;
  @ViewChild('modalPrice')
  modalPrice!: IonModal;
  @ViewChild('modalEligibitlity')
  modalEligibitlity!: IonModal;
  productTypeList: ProductTypes = [];
  brandList: Brands = [];
  brands!: Item[];
  products!: Item[];
  selectedBrand: Item = { text: 'Marque', value: '' };
  selectedProduct: Item = { text: 'Type de produit', value: '' };
  ammount!: any;
  orgId!: string;


  constructor(private readonly ecoSupportService: EcoSupportService, public modalCtrl: ModalController, private readonly store: DataStore, private readonly router: Router,
    private readonly toastController: ToastController, private inAppBrowser: InAppBrowser

  ) {
    this.getLists();
  }

  calculate() {
    const req = {
      productId: this.selectedProduct.value,
      brandId: this.selectedBrand.value,
    }

    this.ecoSupportService
      .getEcoOrganization(this.selectedBrand.value, this.selectedProduct.value)
      .pipe(
        tap((response: ApiResponse<any> | null) => {
          if (response) {
            const organizationId = response.ResponseData.EcoOrganizationId;
            this.orgId = organizationId

            this.store.setOrganizationId(organizationId);

          }
        })
      )
      .subscribe();
    const selectedProduct = this.productTypeList.find(item => item.ProductId === this.selectedProduct.value);
    if (selectedProduct) {
      this.store.setSelectedProductSymptoms(selectedProduct.IRISSymtoms);
      this.store.setSelectedProductRepairCodes(selectedProduct.RepairCodes);
      this.ecoSupportService.calculatEcoSupport(req, selectedProduct.RepairCodes[0]).subscribe(
        (response: ApiResponse<any> | null) => {
          if (response && response.ResponseData[0].SupportAmount) {
            this.store.setBrandId(this.selectedBrand.value);
            this.store.setProductId(this.selectedProduct.value);
            this.store.setSupportAmount(response.ResponseData[0].SupportAmount);
            this.ammount = response.ResponseData[0].SupportAmount;
            this.openModal();
          }
        },
        (error) => {
          // Handle and show error
          this.openModalEligib();
        }
      );
    }
  }

  async show(msg: string) {
    const toast = await this.toastController.create({
      message: msg,
      duration: 2000,
      position: 'top',
      color: 'danger',
    });
    await toast.present();
  }
  async openModal() {
    this.modalPrice.present();
  }
  async openModalEligib() {
    this.modalEligibitlity.present();
  }
  getLists() {


    this.ecoSupportService.getBrandList().pipe(tap(
      (response: ApiResponse<Brands> | null) => {
        if (response) {
          this.brandList = response.ResponseData;
          this.brands = response.ResponseData.map(item => {
            return {
              "value": item.BrandId,
              "text": item.BrandName
            };
          })
        }
      })
    ).subscribe();

    this.ecoSupportService.getProductTypeList().pipe(tap(
      (response: ApiResponse<ProductTypes> | null) => {
        if (response) {
          this.productTypeList = response.ResponseData;
          this.products = response.ResponseData.map(item => {
            return {
              "value": item.ProductId,
              "text": item.ProductName
            };
          })
        }
      })
    ).subscribe();
  }

  brandSelectionChanged(brand: Item) {
    this.selectedBrand = brand;
    this.modalBrand.dismiss();
  }

  productSelectionChanged(product: Item) {
    this.selectedProduct = product;
    this.modalProduct.dismiss();
  }

  createClaim() {
    const navigationExtras: NavigationExtras = {
      replaceUrl: true // Set replaceUrl to true to reset the page
    };
    this.router.navigate([RoutesPaths.CREATE]);
    this.selectedBrand = { text: 'Marque', value: '' };
    this.selectedProduct = { text: 'Type de produit', value: '' };
    this.modalPrice.dismiss();
  }
  close() {
    this.modalPrice.dismiss();
  }
  closeElig() {
    this.modalEligibitlity.dismiss();
  }

  redirect() {
    const browser = this.inAppBrowser.create('https://myspace.agoraplus.com/', '_system');
  }
}
