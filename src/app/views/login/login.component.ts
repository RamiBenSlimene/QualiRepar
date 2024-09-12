import { Component, HostListener } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { GoogleAnalyticsEffect } from 'src/app/effects/google.analytics.effects';
import { RoutesPaths } from 'src/app/enums/RoutesPath';
import { fadeInOut } from 'src/app/helpers/animation';
import { DataStore } from 'src/app/helpers/data.store';
import { EcoSupportService } from 'src/app/services/eco-support.service';
import { LoginForm } from 'src/app/types/login.form';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  animations: [fadeInOut],
})
export class LoginComponent {
  request: LoginForm = {};
  form: FormGroup;
  remmberMe: boolean = false;

  constructor(
    private readonly fb: FormBuilder,
    private readonly toastController: ToastController,
    private readonly router: Router,
    private readonly service: EcoSupportService,
    private readonly store: DataStore,
    private readonly googleAnalyticsEffect : GoogleAnalyticsEffect

  ) {
    if (this.store.getKey()) {
      this.router.navigate([`/${RoutesPaths.CLAIM}/${RoutesPaths.REQUEST}`]);
    }
    this.form = this.fb.group({
      User: ['', Validators.required],
      Password: ['', Validators.required],
      rememberCredentials: [false]
    });
  }
  @HostListener('document:keydown.enter', ['$event'])
  onEnterKey(event: KeyboardEvent) {
    if(event.view?.location.pathname == `/${RoutesPaths.LOGIN}`){
      this.login();
    }
  }

  login() {
    if (this.form.valid) {
      this.request = {
        User: this.form.value.User,
        Password: this.form.value.Password,
      };
      this.service.login(this.request).subscribe(
        data => {
          if (data) {
            this.googleAnalyticsEffect.onLoginSuccess();

            this.store.setKey(this.form.value.rememberCredentials, data);
            if (this.store.getKey()) {
              this.router.navigate([`/${RoutesPaths.CLAIM}/${RoutesPaths.REQUEST}`]);
            } else {
              this.store.setKey(this.form.value.rememberCredentials, data);
            }
            this.router.navigate([`/${RoutesPaths.CLAIM}/${RoutesPaths.REQUEST}`]);
          } else {
            this.show("Veuillez réessayer plus tard");
            this.googleAnalyticsEffect.onLoginFailure();

          }
        },
        (_) => {
          this.show('Compte ou mot de passe incorrect');
          this.googleAnalyticsEffect.onLoginFailure();

        }
      );
    } else {
      this.show('Formulaire invalide');
      this.googleAnalyticsEffect.onLoginFailure();

    }
  }



  onToggleRememberCredentials(event: CustomEvent) {
  }

  forgotPassword() {
    window.open("https://myspace.agoraplus.com/Account/ForgottenPasswordPopUp", "_blank");
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
}
