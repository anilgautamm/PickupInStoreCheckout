import React, { memo, FunctionComponent } from 'react';

import { withCheckout } from '../checkout';
import { TranslatedString } from '../locale';
import { Button, ButtonSize, ButtonVariant } from '../ui/button';

import { PaymentMethodId, PaymentMethodType } from './paymentMethod';

interface PaymentSubmitButtonTextProps {
    methodId?: string;
    methodType?: string;
}

const PaymentSubmitButtonText: FunctionComponent<PaymentSubmitButtonTextProps> = memo(({ methodId, methodType }) => {
    if (methodId === PaymentMethodId.Amazon) {
        return <TranslatedString id="payment.amazon_continue_action" />;
    }

    if (methodType === PaymentMethodType.VisaCheckout) {
        return <TranslatedString id="payment.visa_checkout_continue_action" />;
    }

    if (methodType === PaymentMethodType.Chasepay) {
        return <TranslatedString id="payment.chasepay_continue_action" />;
    }

    if (methodType === PaymentMethodType.Paypal) {
        return <TranslatedString id="payment.paypal_continue_action" />;
    }

    if (methodType === PaymentMethodType.PaypalCredit) {
        return <TranslatedString id="payment.paypal_credit_continue_action" />;
    }

    return <TranslatedString id="payment.place_order_action" />;
});

export interface PaymentSubmitButtonProps {
    methodId?: string;
    methodType?: string;
    isDisabled?: boolean;
}

interface WithCheckoutPaymentSubmitButtonProps {
    isInitializing?: boolean;
    isSubmitting?: boolean;
}

const PaymentSubmitButton: FunctionComponent<PaymentSubmitButtonProps & WithCheckoutPaymentSubmitButtonProps> = ({
    isDisabled,
    isInitializing,
    isSubmitting,
    methodId,
    methodType,
}) => (
    <Button
        disabled={ isInitializing || isSubmitting || isDisabled }
        id="checkout-payment-continue"
        isFullWidth
        isLoading={ isSubmitting }
        size={ ButtonSize.Large }
        type="submit"
        variant={ ButtonVariant.Action }
    >
        <PaymentSubmitButtonText
            methodId={ methodId }
            methodType={ methodType }
        />
    </Button>
);

export default withCheckout(({ checkoutState }) => {
    const {
        statuses: {
            isInitializingCustomer,
            isInitializingPayment,
            isSubmittingOrder,
        },
    } = checkoutState;

    return {
        isInitializing: isInitializingCustomer() || isInitializingPayment(),
        isSubmitting: isSubmittingOrder(),
    };
})(memo(PaymentSubmitButton));
