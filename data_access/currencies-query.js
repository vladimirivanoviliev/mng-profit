const MS_DAY = 1000 * 60 * 60 * 24;

const LAST_DAY_PROFIT = `
select dayProfit
from history
where name = currency.name
order by date desc
limit 1
`;

function avgWeek() {
    const lastWeek = new Date().getTime() - MS_DAY * 7;
    return `
select avg(dayProfit)
from history
where name = currency.name and date >= ${ lastWeek }
`;
}

function avgMonth() {
    const now = new Date();
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate()).getTime();
    return `
select avg(dayProfit)
from history
where name = currency.name and date >= ${ lastMonth }
`;
}

const currenciesQuery = () =>`
SELECT name, fullName, algorithm, url,
    (${ LAST_DAY_PROFIT }) dayProfit, 
    (${ avgWeek() }) avgWeek, 
    (${ avgMonth() }) avgMonth 
FROM currency
order by dayProfit desc
`;

export default currenciesQuery;