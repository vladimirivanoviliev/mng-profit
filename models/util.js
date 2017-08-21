const parseSeparatedFloat = (number) => {
    if (!number) {
        return 0;
    }

    if (typeof number === 'string') {
        number = number.replace(/[^0-9\.]/g, '');
    }
    
    return parseFloat(number);
};

const parseCustomInt = (number) => {
    if (typeof number === 'string') {
        number = number.replace(/[^0-9]/g, '');
    }

    return parseInt(number) || 0;
};

const parseRelativeTime = (timeString) => {
    let seconds = 0;
    const timeParts = timeString.split(' ');
    timeParts.forEach((item) => {
        const current = parseInt(current);

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

const parseHashRate = (hashString) => {
    if (!number) {
        return 0;
    }

    const hashNumber = number.replace(/[^0-9]/g, '');
    const hashRate = number.split('/')[0].replace(/[^a-zA-Z]/g, '');

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