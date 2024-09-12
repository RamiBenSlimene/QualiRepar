import { Component, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { InAppBrowser } from '@awesome-cordova-plugins/in-app-browser/ngx';
import {
  IonModal,
  ModalController,
  ToastController
} from '@ionic/angular';
import { tap } from 'rxjs';
import { GoogleAnalyticsEffect } from 'src/app/effects/google.analytics.effects';
import { RoutesPaths } from 'src/app/enums/RoutesPath';
import { DataStore } from 'src/app/helpers/data.store';
import { EcoSupportService } from 'src/app/services/eco-support.service';
import { ApiResponse } from 'src/app/types/api-response';
import { Brand, Brands } from 'src/app/types/brand';
import { ClaimRequest, RequestUploadEventPayload } from 'src/app/types/claim-request';
import { ProductType, ProductTypes } from 'src/app/types/product-type';

@Component({
  selector: 'app-get-support',
  templateUrl: './get-support.component.html',
  styleUrls: ['./get-support.component.scss'],
})
export class GetSupportComponent {
  @ViewChild('modalBrand', { static: true }) modalBrand!: IonModal;
  @ViewChild('modalProduct', { static: true }) modalProduct!: IonModal;
  @ViewChild('modalPrice') modalPrice!: IonModal;
  @ViewChild('modalEligibitlity') modalEligibitlity!: IonModal;
  productTypeList: ProductTypes = [];
  brandList: Brands = [];
  brand?: Brand;
  product?: ProductType;
  ammount!: any;
  orgId!: string;

  constructor(
    private readonly ecoSupportService: EcoSupportService,
    public modalCtrl: ModalController,
    private readonly store: DataStore,
    private readonly router: Router,
    private readonly toastController: ToastController,
    private inAppBrowser: InAppBrowser,
    private readonly googleAnalyticsEffect: GoogleAnalyticsEffect
  ) {
    this.getLists();
  }

  calculate() {
    if (this.product && this.brand) {
      if (this.product.ProductId && this.brand.BrandId) {
        this.ecoSupportService
          .getEcoOrganization(this.brand.BrandId, this.product.ProductId)
          .pipe(
            tap((response: ApiResponse<any> | null) => {
              if (response) {
                const organizationId = response.ResponseData.EcoOrganizationId;
                this.orgId = organizationId.toString();
                this.store.setOrganizationId(organizationId);
                // get validators 
                this.ecoSupportService.getValidators(this.orgId, 'ISG', 250).subscribe((response: any) => {
                  this.store.setValidatores(response.ResponseData || [])
                });
              }
            })
          )
          .subscribe();
        const selectedProduct = this.productTypeList.find(
          (item) => item.ProductId === this.product?.ProductId
        );
        if (selectedProduct) {
          const req = {
            productId: this.product.ProductId,
            brandId: this.brand.BrandId,
          };
          this.store.setSelectedProductSymptoms(selectedProduct.IRISSymtoms);
          this.store.setSelectedProductRepairCodes(selectedProduct.RepairCodes);
          this.ecoSupportService
            .calculatEcoSupport(req, selectedProduct.RepairCodes[0])
            .subscribe(
              (response: ApiResponse<any> | null) => {
                if (response && response.ResponseData[0].SupportAmount) {
                  this.store.setBrandId(req.brandId);
                  this.store.setProductId(req.productId);
                  if (this.brand) {
                    this.store.setBrandName(this.brand.BrandName);
                  }
                  if (this.product) {
                    this.store.setProductName(this.product.ProductName);
                  }
                  this.store.setSupportAmount(
                    response.ResponseData[0].SupportAmount
                  );
                  this.ammount = response.ResponseData[0].SupportAmount;
                  this.openModal();
                }
              },
              (error) => {
                this.openModalEligib();
              }
            );
        }
      }
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
    this.ecoSupportService
      .getBrandList()
      .pipe(
        tap((response: ApiResponse<Brands> | null) => {
          if (response) {
            this.brandList = response.ResponseData;
          }
        })
      ).subscribe();
    this.ecoSupportService
      .getProductTypeList()
      .pipe(
        tap((response: ApiResponse<ProductTypes> | null) => {
          if (response) {
            this.productTypeList = response.ResponseData;
          }
        })
      ).subscribe();




  }

  // createClaim() {
  //   this.router.navigate([`${RoutesPaths.CLAIM}/${RoutesPaths.CREATE}`]);
  //   this.clearBrand();
  //   this.clearProduct();
  //   this.modalPrice.dismiss();
  // }
  close() {
    this.modalPrice.dismiss();
  }
  closeElig() {
    this.modalEligibitlity.dismiss();
  }
  redirect() {
    const browser = this.inAppBrowser.create(
      'https://myspace.agoraplus.com/',
      '_system'
    );
  }
  upload(event: RequestUploadEventPayload) {
    this.clearBrand();
    this.clearProduct();
    this.modalPrice.dismiss();
    this.googleAnalyticsEffect.onUploadChatGPT();
    this.store.setAiInvoice(event.claimRequest);
    this.router.navigate([`/${RoutesPaths.CLAIM}/${RoutesPaths.CREATE}`, event.claimId]);
  }
  clearProduct() {
    this.product = undefined;
  }
  clearBrand() {
    this.brand = undefined;
  }
}
