import { EV } from '../entities/ev.js';
import { CS } from '../entities/cs.js';
import { CPO } from '../entities/cpo.js';

const ev = new EV('0xd0a5e7b124eb5c1d327f7c19c988bb57979637043e52db48683da62900973b96');
const cs = new CS('0x59fe2715b3dae7ea659aa4d4466d1dbeda7f1d7835fbace6c0da14c303018d30');
const cpo1 = new CPO('0x7efa5e9cc6abc293f1f11072ea93c57c2ae5ecc4dc358ef77d9d2c6c9d9b6ab7');
const cpo2 = new CPO('0x59ee2d860463134cb23261befed94eec33516334781a2725ded2ff1265da51d4');
const cpo3 = new CPO('0xb3357c2e53c1ef0099633f59be3e872cfc492337e89475dbc8cc6bef08bef0f9');

await ev.connectContract();
await cs.connectContract();
await cpo1.connectContract();
await cpo2.connectContract();
await cpo3.connectContract();

ev.listen('Payment').on('data', log => {
    console.log("Payment: ", log.returnValues);
});

if (false) {
    console.log("DEBUG EV: ", await ev.getEV());
    console.log("DEBUG CPO: ", await cpo1.getCPO());
    console.log("DEBUG CS: ", await cs.getCS());
    console.log("DEBUG AGREEMENT: ", await ev.getAgreement(ev.account.address, cpo1.account.address));
    console.log("DEBUG CONNECTION: ", await ev.getConnection(ev.account.address, cs.account.address));
    console.log("DEBUG CHARGING SCHEME: ", await ev.getCharging(ev.account.address, cs.account.address));
    console.log("DEBUG RATE: ", await cpo1.getRate(cpo1.account.address, "SE1"));
    console.log("EV MONEY: ", await ev.balance());
    console.log("EV DEPOSIT: ", await ev.getDeposit());
    console.log("CPO MONEY: ", await cpo1.balance());
}

/*
* STAGE REGISTRATION
*/
if (false) {
    // Register entities
    cpo1.listen('CPORegistered').on('data', log => {
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
    console.log("Registring CPO 1...");
    await cpo1.register(false);
    console.log("Registring CPO 2...");
    await cpo2.register(true);
    console.log("Registring CPO 3...");
    await cpo3.register(false);
    console.log("Registring CS...");
    await cpo1.registerCS(cs.account.address, cs.powerDischarge, cs.hasRenewableEnergy);
}
/*
* STAGE RATES
*/
if (false) {
    // Register rates CPO1 manual
    cpo1.listen('NewRates').on('data', log => {
        console.log("New rates: ", log.returnValues);
    });

    console.log("Registring new rates...");
    let rates = cpo1.generateRates();
    let roaming = cpo1.generateRoaming();
    await cpo1.registerNewRates(rates, roaming);
}
if (false) {
    // Register rates CPO3 manual
    cpo3.listen('NewRates').on('data', log => {
        console.log("New rates: ", log.returnValues);
    });

    console.log("Registring new rates...");
    let rates = cpo3.generateRates2();
    let roaming = cpo3.generateRoaming();
    await cpo3.registerNewRates(rates, roaming);
}
if (false) {
    // Bootstrap rates CPO2 to be automatic
    console.log("Prompring for new rates");
    console.log(await cpo2.contract.methods.updateAutomaticRates().send());
}
if (false) {
    // Register roaming rates
    cpo2.listen('NewRates').on('data', log => {
        console.log("New rates: ", log.returnValues);
    });
    console.log("Next roaming");
    await cpo2.registerNextRoaming(cpo2.generateRoaming());
}
/*
* STAGE AGREEMENT
*/
if (false) {
    // Propose agreement CPO 1, and accept
    cpo1.listen('AgreementProposed').on('data', async log => {
        console.log("New agreement arrived: ", log.returnValues);
        console.log("ev: ", log.returnValues.ev);
        console.log("id: ", log.returnValues.agreement.id);
        console.log("Answering agreement...");
        // Automatically accept
        await cpo1.respondAgreement(log.returnValues.ev, true, log.returnValues.agreement.id);
    });
    ev.listen('AgreementResponded').on('data', log => {
        console.log("Response to agreement: ", log.returnValues);
        console.log("Accepted? ", log.returnValues.agreement.accepted);
    });

    console.log("Proposing agreement...");
    await ev.proposeAgreement(cpo1.account.address);
}
if (false) {
    // Propose agreement CPO 2, and accept
    cpo2.listen('AgreementProposed').on('data', async log => {
        console.log("New agreement arrived: ", log.returnValues);
        console.log("ev: ", log.returnValues.ev);
        console.log("id: ", log.returnValues.agreement.id);
        console.log("Answering agreement...");
        // Automatically accept
        await cpo2.respondAgreement(log.returnValues.ev, true, log.returnValues.agreement.id);
    });
    ev.listen('AgreementResponded').on('data', log => {
        console.log("Response to agreement: ", log.returnValues);
        console.log("Accepted? ", log.returnValues.agreement.accepted);
    });

    console.log("Proposing agreement...");
    await ev.proposeAgreement(cpo2.account.address);
}
if (false) {
    // Revert agreement CPO 3
    ev.listen('AgreementProposalReverted').on('data', log => {
        console.log("Reverted: ", log.returnValues);
    });
    cpo3.listen('AgreementProposed').on('data', async log => {
        console.log("New agreement arrived: ", log.returnValues);
        console.log("ev: ", log.returnValues.ev);
        console.log("id: ", log.returnValues.agreement.id);
        console.log("Answering agreement...");
        // Revert it
        await ev.revertAgreement(cpo3.account.address, log.returnValues.agreement.id);
    });
    console.log("Proposing agreement...");
    await ev.proposeAgreement(cpo3.account.address);
}
if (false) {
    // Propose agreement CPO 3, and accept
    cpo3.listen('AgreementProposed').on('data', async log => {
        console.log("New agreement arrived: ", log.returnValues);
        console.log("ev: ", log.returnValues.ev);
        console.log("id: ", log.returnValues.agreement.id);
        console.log("Answering agreement...");
        // Automatically accept
        await cpo3.respondAgreement(log.returnValues.ev, true, log.returnValues.agreement.id);
    });
    ev.listen('AgreementResponded').on('data', log => {
        console.log("Response to agreement: ", log.returnValues);
        console.log("Accepted? ", log.returnValues.agreement.accepted);
    });

    console.log("Proposing agreement...");
    await ev.proposeAgreement(cpo3.account.address);
}
/*
* STAGE CONNECTION
*/
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
/*
* STAGE CHARGING
*/
if (false) {
    // Request charging, CPO1
    ev.listen('ChargingAcknowledged').on('data', async log => {
        console.log("EV got start charging event ", log.returnValues);
    });
    cs.listen('ChargingAcknowledged').on('data', log => {
        console.log("CS got start charging event ", log.returnValues);
    });
    cs.listen('ChargingRequested').on('data', async log => {
        console.log("CS charging request ", log.returnValues);
        // Acknowledge charging request
        if (true) {
            let schemeId = log.returnValues.scheme.id;
            let EVaddress = log.returnValues.ev;
            console.log("CS is responding to charging request ", schemeId);
            await cs.acknowledgeCharging(EVaddress, schemeId);
        }
    });

    console.log("EV requests charging...");
    await ev.requestCharging(1000, cs.account.address, cpo1.account.address, ev.getTime() + 30);
}
if (false) {
    // Request stop charging
    ev.listen('ChargingStopped').on('data', log => {
        console.log("EV got stop charging event ", log.returnValues);
    });
    cs.listen('ChargingStopped').on('data', log => {
        console.log("CS got stop charging event ", log.returnValues);
    });

    console.log("EV stops charging...");
    console.log(ev.getTime());
    await ev.stopCharging(cs.account.address);
}
if (false) {
    // Request charging, CPO2
    ev.listen('ChargingAcknowledged').on('data', async log => {
        console.log("EV got start charging event ", log.returnValues);
    });
    cs.listen('ChargingAcknowledged').on('data', log => {
        console.log("CS got start charging event ", log.returnValues);
    });
    cs.listen('ChargingRequested').on('data', async log => {
        console.log("CS charging request ", log.returnValues);
        // Acknowledge charging request
        if (true) {
            let schemeId = log.returnValues.scheme.id;
            let EVaddress = log.returnValues.ev;
            console.log("CS is responding to charging request ", schemeId);
            await cs.acknowledgeCharging(EVaddress, schemeId);
        }
    });

    console.log("EV requests charging...");
    await ev.requestCharging(1000, cs.account.address, cpo2.account.address, ev.getTime() + 30);
}
/*
* STAGE SMART CHARGING
*/
if (false) {
    // Schedule and accept smart charging
    ev.listen("SmartChargingScheduled").on('data', async log => {
        console.log("EV new smart charging schedule...", log.returnValues);
        // Accept
        if (true) {
            console.log("EV accept smart charging schedule... ", log.returnValues.scheme.id);
            let schemeId = log.returnValues.scheme.id;
            let CSaddress = log.returnValues.cs;
            await ev.acceptSmartCharging(1000, CSaddress, schemeId);
        }
    });

    if (true) {
        ev.listen('ChargingAcknowledged').on('data', log => {
            console.log("EV got start charging event ", log.returnValues);
        });
        cs.listen('ChargingAcknowledged').on('data', log => {
            console.log("CS got start charging event ", log.returnValues);
        });
        cs.listen('ChargingRequested').on('data', async log => {
            // Start charging
            console.log("CS charging request ", log.returnValues);
            let schemeId = log.returnValues.scheme.id;
            let EVaddress = log.returnValues.ev;
            console.log("CS is responding to charging request ", schemeId);
            await cs.acknowledgeCharging(EVaddress, schemeId);
        });
    }
    console.log("Scheduling smart charging...");
    ev.scheduleSmartCharging(cs.account.address, cpo1.account.address);
}
if (false) {
    // Request stop charging
    ev.listen('ChargingStopped').on('data', log => {
        console.log("EV got stop charging event ", log.returnValues);
    });
    cs.listen('ChargingStopped').on('data', log => {
        console.log("CS got stop charging event ", log.returnValues);
    });

    console.log("EV stops charging...");
    console.log(ev.getTime());
    await ev.stopCharging(cs.account.address);
}