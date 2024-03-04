import { EV } from '../entities/ev.js';
import { CS } from '../entities/cs.js';
import { CPO } from '../entities/cpo.js';
import { Worker } from 'worker_threads';

const ev = new EV('0xd0a5e7b124eb5c1d327f7c19c988bb57979637043e52db48683da62900973b96');
const cs = new CS('0x59fe2715b3dae7ea659aa4d4466d1dbeda7f1d7835fbace6c0da14c303018d30');
const cpo = new CPO('0x7efa5e9cc6abc293f1f11072ea93c57c2ae5ecc4dc358ef77d9d2c6c9d9b6ab7');

await ev.connectContract();
await cs.connectContract();
await cpo.connectContract();

if (false) {
    console.log("DEBUG EV: ", await ev.getEV());
    console.log("DEBUG CPO: ", await cpo.getCPO());
    console.log("DEBUG CS: ", await cs.getCS());
    console.log("DEBUG AGREEMENT: ", await ev.getAgreement(ev.account.address, cpo.account.address));
    console.log("DEBUG CONNECTION: ", await ev.getConnection(ev.account.address, cs.account.address));
    console.log("DEBUG CHARGING SCHEME: ", await ev.getCharging(ev.account.address, cs.account.address));
    console.log("DEBUG RATE: ", await cpo.getRate(cpo.account.address, "SE1"));
    console.log("EV MONEY: ", await ev.balance());
    console.log("EV DEPOSIT: ", await ev.getDeposit());
    console.log("CPO MONEY: ", await cpo.balance());
}

if (false) {
    // Register entities
    cpo.listen('CPORegistered').on('data', log => {
        console.log("Newly registered CPO: ", log.returnValues);
    });
    cs.listen('CSRegistered').on('data', log => {
        console.log("Newly registered CS: ", log.returnValues);
    });
    ev.listen('EVRegistered').on('data', log => {
        console.log("Newly registered EV: ", log.returnValues);
    });

    console.log("Registring EV...");
    await ev.register();
    console.log("Registring CPO...");
    await cpo.register(false);
    console.log("Registring CS...");
    await cpo.registerCS(cs.account.address, cs.powerDischarge, cs.hasRenewableEnergy);

    console.log("EV status: " + await ev.isRegistered() + " " + await ev.isEV());
    console.log("CPO status: " + await cpo.isRegistered() + " " + await cpo.isCPO());
    console.log("CS status: " + await cs.isRegistered() + " " + await cs.isCS());

    // Register rates
    cpo.listen('NewRates').on('data', log => {
        console.log("New rates: ", log.returnValues);
    });

    console.log("Registring new rates...");
    let rates = cpo.generateRates();
    let roaming = cpo.generateRoaming();
    await cpo.registerNewRates(rates, roaming);

    console.log("Registring new rates...");
    rates = cpo.generateRates();
    roaming = cpo.generateRoaming();
    await cpo.registerNewRates(rates, roaming);

    // Propose agreement
    cpo.listen('AgreementProposed').on('data', async log => {
        console.log("New agreement arrived: ", log.returnValues);
        console.log("ev: ", log.returnValues.ev);
        console.log("id: ", log.returnValues.agreement.id);
        console.log("Answering agreement...");
        await cpo.respondAgreement(log.returnValues.ev, true, log.returnValues.agreement.id);
    });
    ev.listen('AgreementResponded').on('data', log => {
        console.log("Response to agreement: ", log.returnValues);
        console.log("Accepted? ", log.returnValues.agreement.accepted);
    });

    console.log("Proposing agreement...");
    await ev.proposeAgreement(cpo.account.address);

    // Make connection
    cs.listen('ConnectionMade').on('data', log => {
        console.log("CS got connection event: ", log.returnValues);
    });
    ev.listen('ConnectionMade').on('data', log => {
        console.log("EV got connection event: ", log.returnValues);
    });

    let nonce = cs.generateNonce();
    console.log("EV connects to CS and gets NONCE: ", nonce);
    console.log("CS sends connection...");
    await cs.connect(ev.account.address, nonce);
    console.log("EV sends connection...");
    await ev.connect(cs.account.address, nonce);
}

if (false) {
    // Disconnect
    cs.listen('Disconnection').on('data', log => {
        console.log("CS disconnection event: ", log.returnValues);
    });
    ev.listen('Disconnection').on('data', log => {
        console.log("EV disconnection event: ", log.returnValues);
    });

    console.log("EV disconnecting from CS...");
    await ev.disconnect(cs.account.address);
}
if (false) {
    // Make connection
    cs.listen('ConnectionMade').on('data', log => {
        console.log("CS got connection event: ", log.returnValues);
    });
    ev.listen('ConnectionMade').on('data', log => {
        console.log("EV got connection event: ", log.returnValues);
    });

    let nonce = cs.generateNonce();
    console.log("EV connects to CS and gets NONCE: ", nonce);
    console.log("CS sends connection...");
    await cs.connect(ev.account.address, nonce);
    console.log("EV sends connection...");
    await ev.connect(cs.account.address, nonce);
}
if (false) {
    // Listenings
    ev.listen('ChargingAcknowledged').on('data', async log => {
        console.log("EV got start charging event ", log.returnValues);
    });
    cs.listen('ChargingAcknowledged').on('data', log => {
        console.log("CS got start charging event ", log.returnValues);
    });
    cs.listen('ChargingRequested').on('data', async log => {
        console.log("CS charging request ", log.returnValues);
        // Start charging
        if (false) {
            let schemeId = log.returnValues.scheme.id;
            let EVaddress = log.returnValues.ev;
            console.log("CS is responding to charging request ", schemeId);
            await cs.acknowledgeCharging(EVaddress, schemeId);
        }
    });

    // Request charging
    console.log("EV requests charging...");
    await ev.requestCharging(1000, cs.account.address, cpo.account.address, ev.getTime() + 30);
}

if (false) {
    let count = 0;
    const worker = new Worker("./tests/worker.js");
    worker.postMessage({
        type: 'init',
        ev: "0xd0a5e7b124eb5c1d327f7c19c988bb57979637043e52db48683da62900973b96",
    });
    await new Promise(r => setTimeout(r, 1000));
    /*ev.listen("SmartChargingScheduled").on('data', async log => {
        //console.log("EV new smart charging schedule...", log.returnValues);
        count++;
        console.log(count);
    });*/
    /*cs.listen('ChargingRequested').on('data', async log => {
        //console.log("CS charging request ", log.returnValues);
        count++;
        console.log(count);
    });*/
    /*ev.listen('ConnectionMade').on('data', log => {
        //console.log("EV got connection event: ", log.returnValues.connection.nonce);
        count++;
        console.log(count);
    });*/
    const nonce_count = Number(await ev.web3.eth.getTransactionCount(ev.account.address));
    console.log(nonce_count);
    const tps = 100;
    const workload = 2000;
    const startTime = Date.now();

    let gas = 1000000;
    let sent = 0;
    let lastSent = Date.now();
    let sendRate = 1000/tps;
    while ( sent < workload ) {
        let current = Date.now();
        let diff = current-lastSent;
        let toSend = Math.floor(diff/sendRate);
        for ( let i = 0; i < toSend && sent < workload; i++ ) {
            console.log(sent, "EV requests charging...");
            worker.postMessage({
                type: 'send',
                nonce: nonce_count+sent,
                value: 1000,
                cs: cs.account.address,
                cpo: cpo.account.address,
                time: ev.getTime() + 60,
                gas: gas++
            });
            //ev.requestChargingExperiment(1000, cs.account.address, cpo.account.address, ev.getTime() + 60, nonce_count+sent);
            sent++;
        }
        if ( toSend > 0 ) {
            lastSent = current;
        }
    }

    /*for ( let i = 0; i < workload; i++ ) {
        await new Promise(r => setTimeout(r, 1000/tps));
        //console.log(i,"Scheduling smart charging...");
        //ev.scheduleSmartChargingExperiment(cs.account.address, cpo.account.address, nonce_count+i);
        console.log(i,"EV requests charging...");
        ev.requestChargingExperiment(1000, cs.account.address, cpo.account.address, ev.getTime() + 60, nonce_count+i);
        //console.log(i,"EV sends connection...");
        //ev.connectExperiment(cs.account.address, nonce_count+i);
    }*/
    
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