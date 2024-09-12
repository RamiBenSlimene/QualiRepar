// import { Component, OnInit } from '@angular/core';
// import { EcoSupportService } from 'src/app/services/eco-support.service';
// import { Item } from 'src/app/types/types';

// @Component({
//   selector: 'app-hexa-posts-select',
//   templateUrl: './hexa-posts-select.component.html',
//   styleUrls: ['./hexa-posts-select.component.scss'],
// })

// export class HexaPostsSelectComponent implements OnInit {
//   filtredZipCodes!: Item[];

//   constructor(private ecosupport: EcoSupportService) { }

//   ngOnInit() { }
//   onZipCodeSearch(term: string) {
//     if (term && term.length >= 1) {
//       this.ecosupport.getCityFromHexaPoste('250', term).subscribe(
//         (response: any[]) => {

//           this.filtredZipCodes = response.map(item => {
//             return {
//               "value": item.city,
//               "text": item.zipCode
//             };
//           })
//         },
//         (error) => {
//           console.error('Error fetching zip codes:', error);
//           this.filtredZipCodes = [];  // Clear results on error
//         }
//       );
//     } else {
//       this.filtredZipCodes = [];
//     }
//   }

// }
