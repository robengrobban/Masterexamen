import { Entity } from './entity.js';

class EV extends Entity {

    /**
     * Variables
     */

    model = 'Volvo C40'
    currentCharge = 3900; // Watt Hours (org 39000)
    maxCapacity = 7800; // Watt Hours (org 78000)
    batteryEfficiency = 0.9;

    /**
     * Functions
     */

    constructor(secret) {
        super(
            secret, // secret
            'ws://192.168.174.130:8546' // network
        )
        
    }

    async register() {
        return await this.contract.methods.registerEV(
            this.account.address, 
            this.wattHoursToWattSeconds(this.maxCapacity), 
            (this.batteryEfficiency*100)
        ).send();
    }

    async proposeAgreement(CPOaddress) {
        return await this.contract.methods.proposeAgreement(
            this.account.address, 
            CPOaddress,
            [50000, false, true, 10] // AgreementProperties
        ).send();
    }

    async revertAgreement(CPOaddress, agreementId) {
        return await this.contract.methods.revertProposedAgreement(
            this.account.address,
            CPOaddress,
            agreementId
        ).send();
    }

    async connect(CSaddress, nonce) {
        return await this.contract.methods.connect(
            this.account.address, 
            CSaddress, 
            this.web3.utils.toBigInt(nonce)
        ).send();
    }
    async connectExperiment(CSaddress, nonce) {
        return await this.contract.methods.connect(
            this.account.address, 
            CSaddress, 
            this.web3.utils.toBigInt(nonce)
        ).send({nonce: nonce});
    }
    async connectExperiment2(CSaddress, nonce, gas) {
        return await this.contract.methods.connect(
            this.account.address, 
            CSaddress, 
            this.web3.utils.toBigInt(nonce)
        ).send({nonce: nonce, gas: gas});
    }

    async disconnect(CSaddress) {
        return await this.contract.methods.disconnect(
            this.account.address,
            CSaddress
        ).send();
    }

    async estimateChargingPrice(CSaddress) {
        return await this.contract.methods.estimateChargingPrice(
            this.account.address, 
            CSaddress, 
            0,
            this.wattHoursToWattSeconds(this.currentCharge)
        ).call();
    }

    async getChargingScheme(CSaddress, CPOaddress) {
        return await this.contract.methods.getChargingScheme(
            this.account.address, 
            CSaddress, 
            CPOaddress,
            0,
            this.wattHoursToWattSeconds(this.currentCharge),
            this.wattHoursToWattSeconds(this.maxCapacity)
        ).call();
    }

    async requestCharging(value, CSaddress, CPOaddress, startTime, targetCharge = this.wattHoursToWattSeconds(this.maxCapacity)) {
        return await this.contract.methods.requestCharging(
            this.account.address,
            CSaddress,
            CPOaddress,
            startTime,
            this.wattHoursToWattSeconds(this.currentCharge),
            targetCharge
        ).send({value: value});
    }
    async requestChargingExperiment(value, CSaddress, CPOaddress, startTime, nonce, targetCharge = this.wattHoursToWattSeconds(this.maxCapacity)) {
        return await this.contract.methods.requestCharging(
            this.account.address,
            CSaddress,
            CPOaddress,
            startTime,
            this.wattHoursToWattSeconds(this.currentCharge),
            targetCharge
        ).send({value: value, nonce: nonce});
    }
    async requestChargingExperiment2(value, CSaddress, CPOaddress, startTime, nonce, gas, targetCharge = this.wattHoursToWattSeconds(this.maxCapacity)) {
        return await this.contract.methods.requestCharging(
            this.account.address,
            CSaddress,
            CPOaddress,
            startTime,
            this.wattHoursToWattSeconds(this.currentCharge),
            targetCharge
        ).send({value: value, nonce: nonce, gas: gas});
    }

    async stopCharging(CSaddress) {
        return await this.contract.methods.stopCharging(
            this.account.address,
            CSaddress
        ).send();
    }

    async getDeposit() {
        return await this.contract.methods.getDeposit(
            this.account.address
        ).call();
    }
    async addDeposit(value) {
        return await this.contract.methods.addDeposit(
            this.account.address
        ).send({value: value});
    }
    async withdrawDeposit() {
        return await this.contract.methods.withdrawDeposit(
            this.account.address
        ).send();
    }

    async scheduleSmartCharging(CSaddress, CPOaddress, maxHours = 1) {
        return await this.contract.methods.scheduleSmartCharging(
            this.account.address,
            CSaddress,
            CPOaddress,
            this.wattHoursToWattSeconds(this.currentCharge),
            this.getTime() + 60 * 60 * maxHours
        ).send();
    }
    async scheduleSmartChargingExperiment(CSaddress, CPOaddress, nonce, maxHours = 1) {
        return await this.contract.methods.scheduleSmartCharging(
            this.account.address,
            CSaddress,
            CPOaddress,
            this.wattHoursToWattSeconds(this.currentCharge),
            this.getTime() + 60 * 60 * maxHours
        ).send({nonce: nonce});
    }

    async acceptSmartCharging(value, CSaddress, schemeId) {
        return await this.contract.methods.acceptSmartCharging(
            this.account.address,
            CSaddress,
            schemeId
        ).send({value: value});
    }

    wattHoursToWattSeconds(wattHours) {
        return wattHours*3600;
    }

}

export { EV }