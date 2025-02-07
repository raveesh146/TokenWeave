// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

interface IProductVerifier {
    function verifyProof(
        uint[2] memory _pA,
        uint[2][2] memory _pB,
        uint[2] memory _pC,
        uint[5] memory _pubSignals
    ) external view returns (bool);
} 