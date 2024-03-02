import { parentPort } from 'worker_threads';
import { EV } from '../entities/ev.js';

let car;

parentPort.on('message', async (data) => {

    if (data.type == "init") {
        car = new EV(data.ev);
        await car.connectContract();
    }
    else if (data.type == "send") {
        await car.requestChargingExperiment2(data.value, data.cs, data.cpo, data.time, data.nonce, data.gas);
    }

});
