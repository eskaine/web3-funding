// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "./PriceConverter.sol";

error FundMe__NotOwner();

/**@notice This contract is for creating a funding contract
 * @dev This implements price feeds as our library
 */

contract Funding {
    using PriceConverter for uint256;

    uint256 public constant MINIMUM_USD = 50 * 10**18;
    address private immutable owner;
    address[] private funders;
    mapping(address => uint256) private addressToAmountFunded;
    AggregatorV3Interface private priceFeed;

    modifier onlyOwner() {
        if (msg.sender != owner) revert FundMe__NotOwner();
        _;
    }

    constructor(address priceFeed) {
        priceFeed = AggregatorV3Interface(priceFeed);
        owner = msg.sender;
    }

    function fund() public payable {
        require(msg.value.getConversionRate(priceFeed) >= MINIMUM_USD, "You need to spend more ETH!");

        addressToAmountFunded[msg.sender] += msg.value;
        funders.push(msg.sender);
    }

    function withdraw() public payable onlyOwner {
        for (uint256 funderIndex = 0; funderIndex < funders.length; funderIndex++) {
            address funder = funders[funderIndex];
            addressToAmountFunded[funder] = 0;
        }

        funders = new address[](0);

        (bool success, ) = owner.call{value: address(this).balance}("");
        require(success, "Only owner may withdraw!");
    }

    function cheaperWithdraw() public payable onlyOwner {
        address[] memory funders = funders;

        for (uint256 funderIndex = 0; funderIndex < funders.length; funderIndex++) {
            address funder = funders[funderIndex];
            addressToAmountFunded[funder] = 0;
        }

        funders = new address[](0);

        (bool success, ) = owner.call{value: address(this).balance}("");
        require(success, "Only owner may withdraw!");
    }

    /** @notice Gets the amount that an address has funded
     *  @param fundingAddress the address of the funder
     *  @return the amount funded
     */
    function getAddressToAmountFunded(address fundingAddress) public view returns (uint256) {
        return addressToAmountFunded[fundingAddress];
    }

    function getVersion() public view returns (uint256) {
        return priceFeed.version();
    }

    function getFunder(uint256 index) public view returns (address) {
        return funders[index];
    }

    function getOwner() public view returns (address) {
        return owner;
    }

    function getPriceFeed() public view returns (AggregatorV3Interface) {
        return priceFeed;
    }
}
