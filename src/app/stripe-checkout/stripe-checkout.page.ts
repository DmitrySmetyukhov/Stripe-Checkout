import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {CheckoutService} from '../shared/checkout.service';

@Component({
    selector: 'app-stripe-checkout',
    templateUrl: './stripe-checkout.page.html',
    styleUrls: ['./stripe-checkout.page.scss'],
})
export class StripeCheckoutPage implements OnInit {
    public message = 'Waiting for purchase to complete...';
    public waiting = true;

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private checkoutService: CheckoutService
    ) {
    }

    ngOnInit() {
        const result = this.route.snapshot.queryParamMap.get('purchaseResult');

        if (result === 'success') {
            const ongoingPurchaseSessionId = this.route.snapshot.queryParamMap.get('ongoingPurchaseSessionId');
            this.checkoutService.waitForPurchaseCompleted(ongoingPurchaseSessionId).subscribe(
                () => {
                    this.waiting = false;
                    this.message = 'Purchase successful, redirecting...';
                    setTimeout(() => this.router.navigate(['/home']), 3000);
                }
            );
        } else {
            this.waiting = false;
            this.message = 'Purchase cancelled or failed, redirecting...';
            setTimeout(() => this.router.navigate(['/home']), 3000);
        }
    }

}
