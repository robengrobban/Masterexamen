// SPDX-License-Identifier: MIT

pragma solidity ^0.8.23;

import './Structure.sol';
import './IAgreement.sol';
import './IContract.sol';

contract Agreement is Structure, IAgreement {

    /*
    * CONTRACT MANAGMENT
    */
    address private immutable owner;
    IContract private contractInstance;
    address private contractAddress;

    constructor () {
        owner = msg.sender;
    }

    function set(address _contractAddress) public {
        require(msg.sender == owner, "101");

        contractInstance = IContract(_contractAddress);
        contractAddress = _contractAddress;
    }
    
    /*
    * VARIABLES
    */

    uint private nextAgreementId;

    /*
    * PUBLIC FUNCTIONS
    */

    function proposeAgreement(address EVaddress, address CPOaddress, AgreementParameters calldata agreementParameters) public returns (Agreement memory) {
        require(msg.sender == contractAddress, "102");
        require(EVaddress == tx.origin, "402");
        require(contractInstance.isEV(EVaddress), "402");
        require(contractInstance.isCPO(CPOaddress), "203");
        require(agreementParameters.maxRatePrecision > 0, "507");
        require(agreementParameters.lengthInDays > 0, "508");

        Agreement memory currentAgreement = contractInstance.getAgreement(EVaddress, CPOaddress);
        if ( currentAgreement.EV != address(0) && !currentAgreement.accepted && currentAgreement.endDate > block.timestamp ) {
            revert("501");
        }
        else if ( contractInstance.isAgreementActive(EVaddress, CPOaddress) ) {
            revert("502");
        }

        Agreement memory proposedAgreement = Agreement({
            id: getNextAgreementId(),
            EV: EVaddress,
            CPO: CPOaddress,
            accepted: false,
            startDate: block.timestamp,
            endDate: block.timestamp + agreementParameters.lengthInDays * 1 days,
            parameters: agreementParameters
        });

        return proposedAgreement;
    }

    function revertProposedAgreement(address EVaddress, address CPOaddress, uint agreementId) public view returns (Agreement memory) {
        require(msg.sender == contractAddress, "102");
        require(EVaddress == tx.origin, "402");
        require(contractInstance.isEV(EVaddress), "403");
        require(contractInstance.isCPO(CPOaddress), "203");

        Agreement memory agreement = contractInstance.getAgreement(EVaddress, CPOaddress);

        require(agreement.EV != address(0), "503");
        require(!agreement.accepted, "504");
        require(agreement.id == agreementId, "505");

        //Agreement memory deleted;
        //return deleted;
        delete agreement;
        return agreement;
    }

    function respondAgreement(address EVaddress, address CPOaddress, bool accepted, uint agreementId) public view returns (Agreement memory) {
        require(msg.sender == contractAddress, "102");
        require(CPOaddress == tx.origin, "202");
        require(contractInstance.isEV(EVaddress), "403");
        require(contractInstance.isCPO(CPOaddress), "203");

        Agreement memory agreement = contractInstance.getAgreement(EVaddress, CPOaddress);

        require(agreement.EV != address(0), "503");
        require(!agreement.accepted, "504");
        require(agreement.id == agreementId, "505");

        if ( accepted ) {
            agreement.accepted = accepted;
            return agreement;
        }
        //Agreement memory deleted;
        //return deleted;
        delete agreement;
        return agreement;
    }

    /*
    * PRIVATE FUNCTIONS
    */

    function getNextAgreementId() private returns (uint) {
        nextAgreementId++;
        return nextAgreementId;
    }

    /*
    * LIBRARY FUNCTIONS
    */

}