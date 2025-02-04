// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

interface IEigenLayerOperator {
    function isOperator(address operator) external view returns (bool);
    function getOperatorStake(address operator) external view returns (uint256);
    function slashOperator(address operator, uint256 amount) external;
} 