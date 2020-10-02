import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { StripeCheckoutPage } from './stripe-checkout.page';

const routes: Routes = [
  {
    path: '',
    component: StripeCheckoutPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class StripeCheckoutPageRoutingModule {}
