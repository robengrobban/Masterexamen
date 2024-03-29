import { Entity } from './entity.js';

class CPO extends Entity {

    /**
     * Variables
     */

    name = "VATTENFALL"
    rateSlots = 60;

    /**
     * Functions
     */

    constructor(secret) {
        super(
            secret, // secret
            'ws://192.168.174.129:8546' // network
        )
    }

    async register(automaticRates) {
        return await this.contract.methods.registerCPO(
            this.account.address,
            this.asciiToHex32(this.name),
            automaticRates
        ).send();
    }

    async registerCS(CSaddress, powerDischarge, hasRenewableEnergy) {
        return await this.contract.methods.registerCS( 
            CSaddress,
            this.account.address,
            this.asciiToHex32("SE1"),
            powerDischarge,
            hasRenewableEnergy
        ).send();
    }

    async respondAgreement(EVaddress, answer, id) {
        return await this.contract.methods.respondAgreement(
            EVaddress, 
            this.account.address, 
            answer, 
            id
        ).send();
    }

    async registerNewRates(rates, roaming, region = "SE1") {
        return await this.contract.methods.setRates(
            this.account.address, 
            this.asciiToHex32(region),
            rates,
            roaming
        ).send();
    }

    async registerNextRoaming(roaming, region = "SE1") {
        return await this.contract.methods.nextRoaming(
            this.account.address, 
            this.asciiToHex32(region),
            roaming
        ).send();
    }

    generateRates() {
        let rates = [];
        for (let i = 0; i < this.rateSlots; i++) {
            if ( i % 2 == 0 ) {
                rates[i] = this.web3.utils.toBigInt(Math.floor( (this.pricePerWattHoursToWattSeconds(0.001)*this.precision*100)+0.5 ));
            }
            else {
                rates[i] = this.web3.utils.toBigInt(Math.floor( (this.pricePerWattHoursToWattSeconds(0.002)*this.precision*100)+0.5 ));
            }
        }
        return rates;
    }
    generateRates2() {
        let rates = [];
        for (let i = 0; i < this.rateSlots; i++) {
            rates[i] = this.web3.utils.toBigInt( Math.floor(this.pricePerWattHoursToWattSeconds((-0.000001*i**2 + 0.0001*i + 0.0001)*this.precision*100)) );
        }
        return rates;
    }

    generateRoaming() {
        return this.web3.utils.toBigInt(Math.floor( (this.pricePerWattHoursToWattSeconds(0.01)*this.precision)+0.5 ));
    }

    pricePerWattHoursToWattSeconds(price) {
        return price / 3600
    }

}

export { CPO }