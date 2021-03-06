import { createLanguageService, LanguageService } from '@bigcommerce/checkout-sdk';
import { ObjectSchema, ValidationError } from 'yup';

import { getShippingAddress } from '../shipping/shipping-addresses.mock';

import { getFormFields } from './formField.mock';
import getAddressValidationSchema from './getAddressValidationSchema';
import { AddressFormValues } from './mapAddressToFormValues';

describe('getAddressValidationSchema', () => {
    const formFields = getFormFields();
    let language: LanguageService;

    beforeEach(() => {
        language = createLanguageService();
        jest.spyOn(language, 'translate').mockImplementation(id => id);
    });

    it('resolves for a valid address', async () => {
        const schema = getAddressValidationSchema({ formFields, language });
        const spy = jest.fn();

        await schema.validate(getShippingAddress()).then(spy);

        expect(spy).toHaveBeenCalled();
    });

    it('throws if missing required field with translated error', async () => {
        const schema = getAddressValidationSchema({ formFields, language });

        const errors = await schema.validate({
            ...getShippingAddress(),
            firstName: undefined,
        }).catch((error: ValidationError) => error.message);

        expect(errors).toEqual('address.first_name_required_error');
    });

    describe('when custom integer field is present', () => {
        let schema: ObjectSchema<Partial<AddressFormValues>>;

        beforeEach(() => {
            schema = getAddressValidationSchema({ formFields: [
                ...formFields,
                {
                    custom: true,
                    min: 3,
                    max: 5,
                    fieldType: 'text',
                    id: 'field_100',
                    name: 'field_100',
                    required: false,
                    type: 'integer',
                } as any,
            ], language });
        });

        it('throws if min validation fails', async () => {
            const errors = await schema.validate({
                ...getShippingAddress(),
                customFields: {
                    field_100: 2,
                },
            }).catch((error: ValidationError) => error.message);

            expect(errors).toEqual('address.custom_min_error');
        });

        it('throws if max validation fails', async () => {
            const errors = await schema.validate({
                ...getShippingAddress(),
                customFields: {
                    field_100: 6,
                },
            }).catch((error: ValidationError) => error.message);

            expect(errors).toEqual('address.custom_max_error');
        });

        it('resolves if min/max validation pass', async () => {
            const spy = jest.fn();
            await schema.validate({
                ...getShippingAddress(),
                customFields: {
                    field_100: 4,
                },
            }).then(spy);

            expect(spy).toHaveBeenCalled();
        });
    });

    describe('when custom radio field is present', () => {
        let schema: ObjectSchema<Partial<AddressFormValues>>;

        beforeEach(() => {
            schema = getAddressValidationSchema({ formFields: [
                ...formFields,
                {
                    options: { items: [{ value: 'x' }, { value: 'y' }] },
                    fieldType: 'dropdown',
                    id: 'field_100',
                    name: 'field_100',
                    required: true,
                    type: 'string',
                    custom: true,
                } as any,
            ], language });
        });

        it('throws if value empty', async () => {
            const errors = await schema.validate({
                ...getShippingAddress(),
                customFields: {
                    field_100: '',
                },
            }).catch((error: ValidationError) => error.message);

            expect(errors).toEqual('address.custom_required_error');
        });

        it('resolves if valid value', async () => {
            const spy = jest.fn();
            await schema.validate({
                ...getShippingAddress(),
                customFields: {
                    field_100: 'x',
                },
            }).then(spy);

            expect(spy).toHaveBeenCalled();
        });
    });
});
