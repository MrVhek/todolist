import { VerifyEmailFormComponent } from './../../components/verify-email-form/verify-email-form.component';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { VerifyEmailPageRoutingModule } from './verify-email-routing.module';
import { VerifyEmailPage } from './verify-email.page';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    VerifyEmailPageRoutingModule,
    TranslateModule,
  ],
  declarations: [
    VerifyEmailPage,
    VerifyEmailFormComponent,
  ]
})
export class VerifyEmailPageModule {}
