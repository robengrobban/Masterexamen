// SPDX-License-Identifier: MIT

pragma solidity ^0.8.23;

import './Structure.sol';

interface IRate is Structure {

    function setRates(address, bytes32, uint[RATE_SLOTS] calldata, uint) external returns (Rate memory);
    function transferToNewRates(Rate memory, bool) external returns (Rate memory);
    function nextRoaming(address, bytes32, uint) external returns (Rate memory);
    function updateAutomaticRates() external;

}