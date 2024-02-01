import { EV } from '../entities/ev.js';
import { CS } from '../entities/cs.js';
import { CPO } from '../entities/cpo.js';

const car = new EV('0xd0a5e7b124eb5c1d327f7c19c988bb57979637043e52db48683da62900973b96');
const station = new CS('0x59fe2715b3dae7ea659aa4d4466d1dbeda7f1d7835fbace6c0da14c303018d30');
const operator = new CPO('0x7efa5e9cc6abc293f1f11072ea93c57c2ae5ecc4dc358ef77d9d2c6c9d9b6ab7');

await car.connectContract();
await station.connectContract();
await operator.connectContract();

if (false) {
    // Register entities
    operator.listen('CPORegistered').on('data', log => {
        console.log("Newly registered CPO: ", log.returnValues);
    });
    station.listen('CSRegistered').on('data', log => {
        console.log("Newly registered CS: ", log.returnValues);
    });
    car.listen('EVRegistered').on('data', log => {
        console.log("Newly registered EV: ", log.returnValues);
    });

    console.log("Registring EV...");
    await car.register();
    console.log("Registring CPO...");
    await operator.register(false);
    console.log("Registring CS...");
    await operator.registerCS(station.account.address, station.powerDischarge, station.hasRenewableEnergy);

    console.log("EV status: " + await car.isRegistered() + " " + await car.isEV());
    console.log("CPO status: " + await operator.isRegistered() + " " + await operator.isCPO());
    console.log("CS status: " + await station.isRegistered() + " " + await station.isCS());

    // Register rates
    operator.listen('NewRates').on('data', log => {
        console.log("New rates: ", log.returnValues);
    });

    console.log("Registring new rates...");
    let rates = operator.generateRates();
    let roaming = operator.generateRoaming();
    await operator.registerNewRates(rates, roaming);

    console.log("Registring new rates...");
    rates = operator.generateRates();
    roaming = operator.generateRoaming();
    await operator.registerNewRates(rates, roaming);

    // Propose agreement
    operator.listen('AgreementProposed').on('data', async log => {
        console.log("New agreement arrived: ", log.returnValues);
        console.log("ev: ", log.returnValues.ev);
        console.log("id: ", log.returnValues.agreement.id);
        console.log("Answering agreement...");
        await operator.respondAgreement(log.returnValues.ev, true, log.returnValues.agreement.id);
    });
    car.listen('AgreementResponded').on('data', log => {
        console.log("Response to agreement: ", log.returnValues);
        console.log("Accepted? ", log.returnValues.agreement.accepted);
    });

    console.log("Proposing agreement...");
    await car.proposeAgreement(operator.account.address);

    // Make connection
    station.listen('ConnectionMade').on('data', log => {
        console.log("CS got connection event: ", log.returnValues);
    });
    car.listen('ConnectionMade').on('data', log => {
        console.log("EV got connection event: ", log.returnValues);
    });

    let nonce = station.generateNonce();
    console.log("EV connects to CS and gets NONCE: ", nonce);
    console.log("CS sends connection...");
    await station.connect(car.account.address, nonce);
    console.log("EV sends connection...");
    await car.connect(station.account.address, nonce);
}

if (false) {
    station.listen('Disconnection').on('data', log => {
        console.log("CS disconnection event: ", log.returnValues);
    });
    car.listen('Disconnection').on('data', log => {
        console.log("EV disconnection event: ", log.returnValues);
    });

    console.log("EV disconnecting from CS...");
    await car.disconnect(station.account.address);
}
if (false) {
    // Make connection
    station.listen('ConnectionMade').on('data', log => {
        console.log("CS got connection event: ", log.returnValues);
    });
    car.listen('ConnectionMade').on('data', log => {
        console.log("EV got connection event: ", log.returnValues);
    });

    let nonce = station.generateNonce();
    console.log("EV connects to CS and gets NONCE: ", nonce);
    console.log("CS sends connection...");
    await station.connect(car.account.address, nonce);
    console.log("EV sends connection...");
    await car.connect(station.account.address, nonce);
}

if (false) {
    let count = 0;
    /*car.listen("SmartChargingScheduled").on('data', async log => {
        //console.log("EV new smart charging schedule...", log.returnValues);
        count++;
        console.log(count);
    });*/
    /*station.listen('ChargingRequested').on('data', async log => {
        //console.log("CS charging request ", log.returnValues);
        count++;
        console.log(count);
    });*/
    /*car.listen('ConnectionMade').on('data', log => {
        //console.log("EV got connection event: ", log.returnValues.connection.nonce);
        count++;
        console.log(count);
    });*/
    const nonce_count = Number(await car.web3.eth.getTransactionCount(car.account.address));
    console.log(nonce_count);
    const tps = 100;
    const workload = 2000;
    const startTime = Date.now();
    for ( let i = 0; i < workload; i++ ) {
        await new Promise(r => setTimeout(r, 1000/tps));
        //console.log(i,"Scheduling smart charging...");
        //car.scheduleSmartChargingExperiment(station.account.address, operator.account.address, nonce_count+i);
        console.log(i,"EV requests charging...");
        car.requestChargingExperiment(1000, station.account.address, operator.account.address, car.getTime() + 60, nonce_count+i);
        //console.log(i,"EV sends connection...");
        //car.connectExperiment(station.account.address, nonce_count+i);
    }
    
    const endTime = Date.now();
    console.log("--- Summary ---")
    console.log("Workload", workload);

    console.log("Targeted tps", tps);
    console.log("Expected time", workload*(1000/tps), "ms");
    console.log("Expected time", (workload*(1000/tps))/1000, "s");

    console.log("Actual tps", workload/((endTime-startTime)/1000));
    console.log("Total time", endTime-startTime, "ms");
    console.log("Total time", (endTime-startTime)/1000, "s");
}