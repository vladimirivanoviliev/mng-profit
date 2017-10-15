class PoloniexInterface {
    constructor() {
        //receive trading data - volume @ price
    }

    //data per PAIR: BTC_XMR
    //[{data: {rate: '0.00300888', type: 'bid', amount: '3.32349029'},type: 'orderBookModify'}] -- actually UPDATE OR ADD
    //[{data: {rate: '0.00311164', type: 'ask' },type: 'orderBookRemove'}]

    //FORMAT the data and enrich it before it hits the model
}