
const FLOAT_REGEX = /[^0-9\.]/g;
const CUSTOM_INT_REGEX = /[^0-9]/g;
const HASH_NUMBER_REGEX = /[^0-9]/g;
const HASH_RATE_REGEX = /[^a-zA-Z]/g;

const parseSeparatedFloat = (number) => {
    if (!number) {
        return 0;
    }

    if (typeof number === 'string') {
        number = number.replace(FLOAT_REGEX, '');
    }
    
    return parseFloat(number);
};

const parseCustomInt = (number) => {
    if (typeof number === 'string') {
        number = number.replace(CUSTOM_INT_REGEX, '');
    }

    return parseInt(number) || 0;
};

const parseRelativeTime = (timeString) => {
    let seconds = 0;
    const timeParts = timeString.split(' ');
    timeParts.forEach((item) => {
        const current = parseInt(item);

        if (item.indexOf('h')) {
            seconds += current * 60 * 60;
        }

        if (item.indexOf('m')) {
            seconds += current * 60;
        }

        if (item.indexOf('s')) {
            seconds += current;
        }
    });

    return seconds;
};

const parseHashRate = (number) => {
    if (!number) {
        return 0;
    }

    let hashNumber = number.replace(HASH_NUMBER_REGEX, '');
    const hashRate = number.split('/')[0].replace(HASH_RATE_REGEX, '');

    switch(hashRate) {
        case 'h':
            break;
        case 'kh':
            hashNumber *= (1000);
            break;
        case 'mh':
            hashNumber *= (1000 * 1000);
            break;
        case 'gh':
            hashNumber *= (1000 * 1000 * 1000);
            break;
        case 'th':
            hashNumber *= (1000 * 1000 * 1000 * 1000);
            break;
        case 'ph':
            hashNumber *= (1000 * 1000 * 1000 * 1000 * 1000);
            break;
    }

    return hashNumber;
}

module.exports = {
    parseSeparatedFloat: parseSeparatedFloat,
    parseCustomInt: parseCustomInt,
    parseRelativeTime: parseRelativeTime,
    parseHashRate: parseHashRate
};