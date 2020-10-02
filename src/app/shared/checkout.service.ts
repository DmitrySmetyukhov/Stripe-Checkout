import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Observable} from 'rxjs';
import {CheckoutSession} from './models/checkout-session.model';
import {AngularFireAuth} from '@angular/fire/auth';
import {AngularFirestore} from '@angular/fire/firestore';
import {filter, first} from 'rxjs/operators';

declare const Stripe;

@Injectable({
    providedIn: 'root'
})
export class CheckoutService {
    private jwtAuth: string;

    constructor(
        private http: HttpClient,
        private afAuth: AngularFireAuth,
        private db: AngularFirestore
    ) {
        afAuth.idToken.subscribe(jwt => this.jwtAuth = jwt);
    }

    startUnitCheckoutSession(unitId: string): Observable<CheckoutSession> {
        const headers = new HttpHeaders().set('Authorization', this.jwtAuth);

        // todo remove hardcoded quantity
        return this.http.post<CheckoutSession>('/api/checkout',
            {unitId, quantity: 1, callbackUrl: this.buildCallbackUrl()}, {headers});
    }

    redirectToCheckout(session: CheckoutSession) {
        const stripe = Stripe(session.stripePublicKey);
        stripe.redirectToCheckout({
            sessionId: session.stripeCheckoutSessionId
        });
    }

    waitForPurchaseCompleted(ongoingPurchaseSessionId: string): Observable<any> {
        return this.db.doc<any>(`purchaseSessions/${ongoingPurchaseSessionId}`)
            .valueChanges()
            .pipe(filter(purchase => purchase.status === 'completed'), first());
    }

    private buildCallbackUrl = () => {
        const protocol = window.location.protocol;
        const hostName = window.location.hostname;
        const port = window.location.port;

        let callbackUrl = `${protocol}//${hostName}`;

        if (port) {
            callbackUrl += ':' + port;
        }

        callbackUrl += '/stripe-checkout';

        return callbackUrl;
    };
}
