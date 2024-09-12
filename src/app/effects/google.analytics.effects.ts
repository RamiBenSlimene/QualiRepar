import { Injectable } from '@angular/core';
import { GoogleAnalyticsService } from 'ngx-google-analytics';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class GoogleAnalyticsEffect {
  constructor(private gaService: GoogleAnalyticsService) {}

  onLoginSuccess() {
    this.gaService.event(
      'login_success',
      'engagement',
      `[${environment.name}] Le réparateur se connecte avec succès sur la plateforme`
    );
  }

  onLoginFailure() {
    this.gaService.event(
      'login_failure',
      'engagement',
      `[${environment.name}] Le réparateur se connecte avec une erreur sur la plateforme`
    );
  }
  onCreateClaim() {
    this.gaService.event(
      'claim_create ',
      'engagement',
      "Le réparateur se connecte sur la page de création d'un claim"
    );
  }
  onUploadChatGPT() {
    this.gaService.event(
      'claim_upload_chatGPT',
      'engagement',
      `[${environment.name}] Le réparateur upload sa facture et QRF appelle chatGPT`
    );
  }
  onClaimComplete() {
    this.gaService.event(
      'claim_complete',
      'engagement',
      `[${environment.name}] Le réparateur envoie la demande`
    );
  }
  onClaimSave() {
    this.gaService.event(
      'claim_save',
      'engagement',
      `[${environment.name}] Le réparateur sauvegarde la demande`
    );
  }

  onViewClaim() {
    this.gaService.event(
      'claim_browse_all',
      'engagement',
      `[${environment.name}] Le réparateur affiche la page de suivi des demandes`
    );
  }
  onUpdateClaim() {
    this.gaService.event(
      'claim_edit_one',
      'engagement',
      `[${environment.name}] Le réparateur affiche la page de modification d'une demande`
    );
  }
}
