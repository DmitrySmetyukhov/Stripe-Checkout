import {Request, Response} from 'express';
import {db, getDocData} from './database';

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

export async function stripeWebhooks(req: Request, res: Response) {

    try {
        const signature = req.headers['stripe-signature'];

        // signature validation, must be from Stripe only!
        const event = stripe.webhooks.constructEvent(req.body, signature, process.env.STRIPE_WEBHOOK_SECRET);

        if (event.type === 'checkout.session.completed') {
            const session = event.data.object;
            // console.log(session, 'session***');

            await onCheckoutSessionCompleted(session);
        }

        res.json({received: true});

    } catch (e) {
        console.log('Error processing webhook event: ', e);
        return res.status(400).send(`Webhook Error: ${e.message}`);
    }

}

async function onCheckoutSessionCompleted(session) {

    const purchaseSessionId = session.client_reference_id;
    const {userId, unitId, quantity} = await getDocData(`purchaseSessions/${purchaseSessionId}`);

    if (unitId) {
        await fulfillUnitPurchase(userId, unitId, quantity, purchaseSessionId, session.customer);
    }
}

async function fulfillUnitPurchase(userId: string, unitId: string, quantity: number, purchaseSessionId: string, stripeCustomerId: string) {

    const batch = db.batch();

    const purchaseSessionRef = db.doc(`purchaseSessions/${purchaseSessionId}`);

    batch.update(purchaseSessionRef, {status: 'completed'});

    // const userUnitsOwnedRef = db.collection(`users/${userId}/unitsOwned`).set({unitId});
    await db.collection(`users/${userId}/unitsOwned`).add({unitId, quantity});

    // batch.create(userUnitsOwnedRef, {});

    const userRef = db.doc(`users/${userId}`);

    batch.set(userRef, {stripeCustomerId}, {merge: true});

    return batch.commit();
}

// *! for local testing install stripe CLI https://dashboard.stripe.com/test/webhooks
// stripe listen --forward-to localhost:9000/stripe-webhooks for start listening on local machine
// change STRIPE_WEBHOOK_SECRET to Your webhook signing secret from terminal
