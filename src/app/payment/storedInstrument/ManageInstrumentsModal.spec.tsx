import { createCheckoutService, CheckoutSelectors, CheckoutService, RequestError } from '@bigcommerce/checkout-sdk';
import { mount } from 'enzyme';
import React, { FunctionComponent } from 'react';

import { CheckoutProvider } from '../../checkout';
import { getStoreConfig } from '../../config/config.mock';
import { createLocaleContext, LocaleContext, LocaleContextType } from '../../locale';
import { Modal } from '../../ui/modal';

import { getInstruments } from './instruments.mock';
import ManageInstrumentsAlert from './ManageInstrumentsAlert';
import ManageInstrumentsModal, { ManageInstrumentsModalProps } from './ManageInstrumentsModal';
import ManageInstrumentsTable from './ManageInstrumentsTable';

describe('ManageInstrumentsModal', () => {
    let ManageInstrumentsModalTest: FunctionComponent<ManageInstrumentsModalProps>;
    let checkoutService: CheckoutService;
    let checkoutState: CheckoutSelectors;
    let defaultProps: ManageInstrumentsModalProps;
    let localeContext: LocaleContextType;

    beforeEach(() => {
        defaultProps = {
            isOpen: true,
            methodId: 'braintree',
            onAfterOpen: jest.fn(),
            onRequestClose: jest.fn(),
        };

        checkoutService = createCheckoutService();
        checkoutState = checkoutService.getState();

        jest.spyOn(checkoutState.data, 'getConfig')
            .mockReturnValue(getStoreConfig());

        jest.spyOn(checkoutState.data, 'getInstruments')
            .mockReturnValue(getInstruments());

        localeContext = createLocaleContext(getStoreConfig());

        ManageInstrumentsModalTest = props => (
            <CheckoutProvider checkoutService={ checkoutService }>
                <LocaleContext.Provider value={ localeContext }>
                    <ManageInstrumentsModal { ...props } />
                </LocaleContext.Provider>
            </CheckoutProvider>
        );
    });

    it('renders list of instruments in table format', () => {
        const component = mount(<ManageInstrumentsModalTest { ...defaultProps } />);

        expect(component.find(ManageInstrumentsTable).length)
            .toEqual(1);
    });

    it('only render modal if configured to do so', () => {
        const component = mount(<ManageInstrumentsModalTest
            { ...defaultProps }
            isOpen={ false }
        />);

        expect(component.find(Modal).prop('isOpen'))
            .toEqual(false);
    });

    it('shows confirmation message before deleting instrument', () => {
        const component = mount(<ManageInstrumentsModalTest { ...defaultProps } />);

        component.find('[data-test="manage-instrument-delete-button"]').at(0)
            .simulate('click');

        expect(component.find('[data-test="modal-body"]').text())
            .toEqual(localeContext.language.translate('payment.instrument_manage_modal_confirmation_label'));
    });

    it('deletes selected instrument and closes modal if user confirms their action', async () => {
        jest.spyOn(checkoutService, 'deleteInstrument')
            .mockResolvedValue(checkoutState);

        const component = mount(<ManageInstrumentsModalTest { ...defaultProps } />);

        component.find('[data-test="manage-instrument-delete-button"]').at(0)
            .simulate('click');

        component.find('[data-test="manage-instrument-confirm-button"]')
            .simulate('click');

        expect(checkoutService.deleteInstrument)
            .toHaveBeenCalledWith(getInstruments()[0].bigpayToken);

        await new Promise(resolve => process.nextTick(resolve));

        expect(defaultProps.onRequestClose)
            .toHaveBeenCalled();
    });

    it('shows list of instruments if user decides to cancel their action', () => {
        const component = mount(<ManageInstrumentsModalTest { ...defaultProps } />);

        component.find('[data-test="manage-instrument-delete-button"]').at(0)
            .simulate('click');

        component.find('[data-test="manage-instrument-cancel-button"]')
            .simulate('click');

        expect(component.find(ManageInstrumentsTable).length)
            .toEqual(1);
    });

    it('cancels "delete confirmation" screen when modal is re-open', () => {
        jest.spyOn(checkoutService, 'deleteInstrument')
            .mockResolvedValue(checkoutState);

        const component = mount(<ManageInstrumentsModalTest { ...defaultProps } />);

        component.find('[data-test="manage-instrument-delete-button"]').at(0)
            .simulate('click');

        // tslint:disable-next-line:no-non-null-assertion
        component.find(Modal)
            .prop('onAfterOpen')!();

        component.update();

        expect(component.find(ManageInstrumentsTable).length)
            .toEqual(1);
    });

    it('displays error message to user if unable to delete instrument', () => {
        jest.spyOn(checkoutState.errors, 'getDeleteInstrumentError')
            .mockReturnValue({ status: 500 } as RequestError);

        const component = mount(<ManageInstrumentsModalTest { ...defaultProps } />);

        expect(component.find(ManageInstrumentsAlert).length)
            .toEqual(1);
    });
});
