import {Component, OnInit} from '@angular/core';
import {UnitsService} from '../shared/units.service';
import {AuthService} from '../shared/auth.service';
import {CheckoutService} from '../shared/checkout.service';

@Component({
    selector: 'app-home',
    templateUrl: 'home.page.html',
    styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit {
    units: any[];
    purchaseStarted: boolean;

    constructor(
        private unitsService: UnitsService,
        private authService: AuthService,
        private checkoutService: CheckoutService
    ) {
    }

    ngOnInit() {
        this.reloadUnits();
    }

    reloadUnits() {
        this.unitsService.loadAllUnits().subscribe(units => {
            this.units = units;
        });
    }

    purchaseUnit(id: string) {
        this.purchaseStarted = true;
        this.checkoutService.startUnitCheckoutSession(id).subscribe(
            session => {
                // console.log(session, 'Stripe checkout initialized');
                this.checkoutService.redirectToCheckout(session);
            },
            err => {
                console.log(err, 'err**');
            }
        );
    }

    logout() {
        this.authService.logout();
    }

}
