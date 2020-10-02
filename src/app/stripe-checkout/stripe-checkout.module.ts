import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { StripeCheckoutPageRoutingModule } from './stripe-checkout-routing.module';

import { StripeCheckoutPage } from './stripe-checkout.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    StripeCheckoutPageRoutingModule
  ],
  declarations: [StripeCheckoutPage]
})
export class StripeCheckoutPageModule {}
