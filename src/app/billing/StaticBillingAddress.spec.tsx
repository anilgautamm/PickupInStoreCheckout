import { createCheckoutService, CheckoutSelectors, CheckoutService } from '@bigcommerce/checkout-sdk';
import { mount } from 'enzyme';
import React, { FunctionComponent } from 'react';

import { StaticAddress } from '../address';
import { getAddress } from '../address/address.mock';
import { getAddressFormFields } from '../address/formField.mock';
import { CheckoutProvider } from '../checkout';
import { getCheckout, getCheckoutPayment } from '../checkout/checkouts.mock';
import { getLanguageService, LocaleProvider } from '../locale';

import StaticBillingAddress, { StaticBillingAddressProps } from './StaticBillingAddress';

describe('StaticBillingAddress', () => {
    let StaticBillingAddressTest: FunctionComponent<StaticBillingAddressProps>;
    let checkoutService: CheckoutService;
    let checkoutState: CheckoutSelectors;
    let defaultProps: StaticBillingAddressProps;

    beforeEach(() => {
        checkoutService = createCheckoutService();
        checkoutState = checkoutService.getState();

        defaultProps = {
            address: getAddress(),
        };

        jest.spyOn(checkoutState.data, 'getCheckout')
            .mockReturnValue(getCheckout());

        jest.spyOn(checkoutState.data, 'getBillingAddressFields')
            .mockReturnValue(getAddressFormFields());

        StaticBillingAddressTest = props => (
            <LocaleProvider checkoutService={ checkoutService }>
                <CheckoutProvider checkoutService={ checkoutService }>
                    <StaticBillingAddress { ...props } />
                </CheckoutProvider>
            </LocaleProvider>
        );
    });

    it('renders address normally if not using Amazon', () => {
        const container = mount(<StaticBillingAddressTest { ...defaultProps } />);

        expect(container.find(StaticAddress).length)
            .toEqual(1);
    });

    it('renders message instead of address when using Amazon', () => {
        jest.spyOn(checkoutState.data, 'getCheckout')
            .mockReturnValue({
                ...getCheckout(),
                payments: [
                    { ...getCheckoutPayment(), providerId: 'amazon' },
                ],
            });

        const container = mount(<StaticBillingAddressTest { ...defaultProps } />);

        expect(container.find(StaticAddress).length)
            .toEqual(0);

        expect(container.text())
            .toEqual(getLanguageService().translate('billing.billing_address_amazon'));
    });

    it('does not render message instead of address when using Amazon if address is incomplete', () => {
        jest.spyOn(checkoutState.data, 'getCheckout')
            .mockReturnValue({
                ...getCheckout(),
                payments: [
                    { ...getCheckoutPayment(), providerId: 'amazon' },
                ],
            });

        const container = mount(<StaticBillingAddressTest
            { ...defaultProps }
            address={ {
                ...defaultProps.address,
                address1: '',
            } }
        />);

        expect(container.find(StaticAddress).length)
            .toEqual(1);
    });
});
