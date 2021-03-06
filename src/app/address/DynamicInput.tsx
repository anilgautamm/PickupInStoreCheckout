import { FormFieldItem } from '@bigcommerce/checkout-sdk';
import { isDate, noop } from 'lodash';
import React, { memo, useCallback, FunctionComponent } from 'react';
import ReactDatePicker from 'react-datepicker';

import { CheckboxInput, InputProps, RadioInput, TextArea, TextInput } from '../ui/form';

import DynamicFormFieldType from './DynamicFormFieldType';

export interface DynamicInputProps extends InputProps {
    id: string;
    additionalClassName?: string;
    value?: string | string[];
    rows?: number;
    fieldType?: DynamicFormFieldType;
    options?: FormFieldItem[];
}

const DynamicInput: FunctionComponent<DynamicInputProps> = ({
    additionalClassName,
    fieldType,
    id,
    name,
    onChange = noop,
    options,
    placeholder,
    value,
    ...rest
}) => {
    const handleDateChange = useCallback((date, event) => onChange({
        ...event,
        target: {
            name,
            value: date,
        },
    }), [
        onChange,
        name,
    ]);

    switch (fieldType) {
    case DynamicFormFieldType.dropdown:
        return (
            <select
                { ...rest as any }
                className="form-select optimizedCheckout-form-select"
                data-test={ `${id}-select` }
                id={ id }
                name={ name }
                onChange={ onChange }
                value={ value === null ? '' : value }
            >
                { placeholder &&
                    <option value="">
                        { placeholder }
                    </option> }
                { options && options.map(({ label, value: optionValue }) =>
                    <option
                        key={ optionValue }
                        value={ optionValue }
                    >
                        { label }
                    </option>
                ) }
            </select>
        );

    case DynamicFormFieldType.radio:
        if (!options || !options.length) {
            return null;
        }

        return <>
            { options.map(({ label, value: optionValue }) =>
                <RadioInput
                    { ...rest }
                    checked={ optionValue === value }
                    id={ `${id}-${optionValue}` }
                    key={ optionValue }
                    label={ label }
                    name={ name }
                    onChange={ onChange }
                    testId={ `${id}-${optionValue}-radio` }
                    value={ optionValue }
                />) }
        </>;

    case DynamicFormFieldType.checkbox:
        if (!options || !options.length) {
            return null;
        }

        return <>
            { options.map(({ label, value: optionValue }) =>
                <CheckboxInput
                    { ...rest }
                    checked={ Array.isArray(value) ? value.includes(optionValue) : false }
                    id={ `${id}-${optionValue}` }
                    key={ optionValue }
                    label={ label }
                    name={ name }
                    onChange={ onChange }
                    testId={ `${id}-${optionValue}-checkbox` }
                    value={ optionValue }
                />) }
        </>;

    case DynamicFormFieldType.date:
        return (
            <ReactDatePicker
                { ...rest as any }
                autoComplete="off"
                // FIXME: we can avoid this by simply using onChangeRaw, but it's not being triggered properly
                // https://github.com/Hacker0x01/react-datepicker/issues/1357
                // onChangeRaw={ rest.onChange }
                calendarClassName="optimizedCheckout-contentPrimary"
                className="form-input optimizedCheckout-form-input"
                maxDate={ rest.max ? new Date(`${rest.max} 00:00:00`) : undefined }
                minDate={ rest.min ? new Date(`${rest.min} 00:00:00`) : undefined }
                name={ name }
                onChange={ handleDateChange }
                placeholderText="MM/DD/YYYY"
                popperClassName="optimizedCheckout-contentPrimary"
                selected={ isDate(value) ? value : undefined }
            />
        );

    case DynamicFormFieldType.multiline:
        return (
            <TextArea
                { ...rest as any }
                id={ id }
                name={ name }
                onChange={ onChange }
                testId={ `${id}-text` }
                type={ fieldType }
                value={ value }
            />
        );

    default:
        return (
            <TextInput
                { ...rest }
                id={ id }
                name={ name }
                onChange={ onChange }
                testId={ `${id}-${ fieldType === DynamicFormFieldType.password ?
                    'password' :
                    'text' }` }
                type={ fieldType }
                value={ value }
            />
        );
    }
};

export default memo(DynamicInput);
