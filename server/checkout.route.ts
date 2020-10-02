import {Request, Response} from 'express';
import {db, getDocData} from './database';
import {Timestamp} from '@google-cloud/firestore';

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

interface RequestInfo {
    unitId: string;
    callbackUrl: string;
    userId: string;
    quantity: number;
}

export async function createCheckoutSession(req: Request, res: Response) {
    try {
        const info: RequestInfo = {
            // @ts-ignore
            unitId: req.body.unitId,
            quantity: req.body.quantity,
            callbackUrl: req.body.callbackUrl,
            userId: req['uid']
        };

        // console.log('Purchasing info: ', info);

        if (!info.userId) {
            const message = 'User must be authenticated.';
            console.log(message);
            res.status(403).json({message});
        }

        // reserve id from collection
        const purchaseSession = await db.collection('purchaseSessions').doc();

        const checkoutSessionData: any = {
            status: 'ongoing',
            created: Timestamp.now(),
            userId: info.userId,
            quantity: info.quantity
        };

        if (info.unitId) {
            checkoutSessionData.unitId = info.unitId;
        }

        // save with status ongoing
        await purchaseSession.set(checkoutSessionData);


        const user = await getDocData(`users/${info.userId}`);

        let sessionConfig;

        if (info.unitId) {
            const unit = await getDocData(`units/${info.unitId}`);
            sessionConfig = setupPurchaseUnitSession(info, unit, purchaseSession.id, user ? user.stripeCustomerId : undefined);
        }

        // console.log(sessionConfig, 'sessionConfig');

        const session = await stripe.checkout.sessions.create(sessionConfig);

        // console.log(session, 'session');

        res.status(200).json({
            stripeCheckoutSessionId: session.id,
            stripePublicKey: process.env.STRIPE_PUBLIC_KEY
        });
    } catch (error) {
        console.log('Unexpected error occurred while purchasing course: ', error);
        res.status(500).json({error: 'Could not initiate Stripe checkout session'});
    }
}

function setupPurchaseUnitSession(info: RequestInfo, unit: any, sessionId: string, stripeCustomerId: string) {
    const config = setupBaseSessionConfig(info, sessionId, stripeCustomerId);
    config.line_items = [
        {
            name: unit.name,
            description: unit.description,
            amount: unit.price,
            currency: 'usd',
            quantity: 1
        }
    ];

    return config;
}

function setupBaseSessionConfig(info: RequestInfo, sessionId: string, stripeCustomerId: string) {
    const config: any = {
        payment_method_types: ['card'],
        success_url: `${info.callbackUrl}/?purchaseResult=success&ongoingPurchaseSessionId=${sessionId}`,
        cancel_url: `${info.callbackUrl}/?purchaseResult=failed`,
        client_reference_id: sessionId
    };

    if (stripeCustomerId) {
        config.customer = stripeCustomerId;
    }

    return config;
}
