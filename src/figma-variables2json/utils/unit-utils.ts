import { E_UNIT_SPEC } from '../constants/config-constants';

function pxToRem(number: number) {
    return number / 16;
}

function getUnit(value: number, unitRem: E_UNIT_SPEC) {
    if (unitRem === E_UNIT_SPEC.REM) {
        const numberRem = pxToRem(value);
        return {
            numberRem,
            numberUnit: E_UNIT_SPEC.REM
        };
    } else {
        return {
            numberRem: value,
            numberUnit: E_UNIT_SPEC.PX
        };
    }
}

export { getUnit };