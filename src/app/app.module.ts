import { LOCALE_ID, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { CommonModule } from '@angular/common';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AgFilterComponent } from './shared/ag-filter/ag-filter.component';
import { AgStepperComponent } from './shared/ag-stepper/ag-stepper.component';
import { HomeComponent } from './views/home/home.component';
import { TypeaheadComponent } from './shared/typeahead/typeahead.component';
import { LoginComponent } from './views/login/login.component';
import { Interceptor } from './helpers/interceptor';
import { CalculateSupportComponent } from './views/calculate-support/calculate-support.component';
import { AgMultipleSelectComponent } from './shared/ag-multiple-select/ag-multiple-select.component';
import { AgSingleSelectComponent } from './shared/ag-single-select/ag-single-select.component';
import { ListComponent } from './views/list/list.component';
import { SuccessComponent } from './views/success/success.component';
import { UploadFileComponent } from './shared/upload-file/upload-file.component';
import { ProductInfoComponent } from './views/request-claim/product-info/product-info.component';
import { BillingInfoComponent } from './views/request-claim/billing-info/billing-info.component';
import { ConsumerInfoComponent } from './views/request-claim/consumer-info/consumer-info.component';
import { InAppBrowser } from '@awesome-cordova-plugins/in-app-browser/ngx';
import { HeaderComponent } from './shared/header/header.component';
import { ClaimListComponent } from './web-views/claim-list/claim-list.component';
import { GetSupportComponent } from './web-views/get-support/get-support.component';
import { CreateClaimComponent } from './web-views/create-claim/create-claim.component';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { TempComponent } from './web-views/temp/temp.component';
import { ImportInvoiceComponent } from './web-views/import-invoice/import-invoice.component';
import { UpdateInvoiceComponent } from './web-views/update-invoice/update-invoice.component';
import { registerLocaleData } from '@angular/common';
import localeFr from '@angular/common/locales/fr';
registerLocaleData(localeFr);
import { ScrollingModule } from '@angular/cdk/scrolling';
import { UploadAttachementComponent } from './web-views/upload-attachement/upload-attachement.component';
import { NgSelectModule } from '@ng-select/ng-select';
import { ClaimUpdateComponent } from './web-views/claim-update/claim-update.component';
import { NgxGoogleAnalyticsModule } from 'ngx-google-analytics';
import { environment } from 'src/environments/environment';
import { AccordionModule } from 'primeng/accordion';
import { SmHeaderComponent } from './shared/sm-header/sm-header.component';
import { ClaimCardComponent } from './web-views/claim-card/claim-card.component';
import { ClickOutsideDirective } from './directives/click-outside';
import { ClaimDetailsComponent } from './web-views/claim-details/claim-details.component';

@NgModule({
  declarations: [
    AppComponent,
    CreateClaimComponent,
    AgFilterComponent,
    AgStepperComponent,
    HomeComponent,
    TypeaheadComponent,
    LoginComponent,
    HomeComponent,
    CalculateSupportComponent,
    AgMultipleSelectComponent,
    AgSingleSelectComponent,
    ListComponent,
    SuccessComponent,
    UploadFileComponent,
    ProductInfoComponent,
    BillingInfoComponent,
    ConsumerInfoComponent,
    ClaimListComponent,
    GetSupportComponent,
    HeaderComponent,
    SmHeaderComponent,
    ImportInvoiceComponent,
    UpdateInvoiceComponent,
    UploadAttachementComponent,
    TempComponent,
    ClaimUpdateComponent,
    ClaimCardComponent,
    ClickOutsideDirective,
    ClaimDetailsComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    IonicModule.forRoot(),
    AppRoutingModule,
    HttpClientModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NgxDatatableModule,
    ScrollingModule,
    NgSelectModule,AccordionModule,
    NgxGoogleAnalyticsModule.forRoot(environment.googleAnalyticsId)
  ],
  providers: [{ provide: RouteReuseStrategy, useClass: IonicRouteStrategy }, { provide: LOCALE_ID, useValue: 'fr' },
  {
    provide: HTTP_INTERCEPTORS,
    useClass: Interceptor,
    multi: true
  }, InAppBrowser],
  bootstrap: [AppComponent],
})
export class AppModule { }
