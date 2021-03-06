import { Checkout, CheckoutPayment } from '@bigcommerce/checkout-sdk';

import { isGiftCertificatePayment } from '../giftCertificate';
import { isStoreCreditPayment } from '../payment/storeCredit';

function getPreselectedPayment(checkout: Checkout): CheckoutPayment | undefined {
    const payments = checkout && checkout.payments ? checkout.payments : [];

    return payments.find(payment =>
        !isGiftCertificatePayment(payment)
        && !isStoreCreditPayment(payment)
        && !!payment.providerId
    );
}

export default function getShippingMethodId(checkout: Checkout): string | undefined {
    const SHIPPING_METHOD_IDS = ['amazon'];
    const preselectedPayment = getPreselectedPayment(checkout);

    return preselectedPayment && SHIPPING_METHOD_IDS.indexOf(preselectedPayment.providerId) > -1 ?
        preselectedPayment.providerId :
        undefined;
}
