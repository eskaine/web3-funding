const { deployments, ethers, getNamedAccounts } = require("hardhat");
const { assert, expect } = require("chai");

describe("Funding", async () => {
    let funding;
    let deployer;
    let mockV3Aggregator;
    const sendValue = ethers.utils.parseEther("1");

    beforeEach(async () => {
        deployer = (await getNamedAccounts()).deployer;
        await deployments.fixture(["all"]);
        funding = await ethers.getContract("Funding", deployer);
        mockV3Aggregator = await ethers.getContract("MockV3Aggregator", deployer);
    });

    describe("constructor", async () => {
        it("Sets aggregator address", async () => {
            const response = await funding.getPriceFeed();
            assert.equal(response, mockV3Aggregator.address);
        });
    });

    describe("fund", async () => {
        it("Fails if there is not enough ETH", async () => {
            await expect(funding.fund()).to.be.revertedWith("You need to spend more ETH!");
        });

        it("Success if ETH is funded", async () => {
            await funding.fund({ value: sendValue });
            const response = await funding.getAddressToAmountFunded(deployer);
            assert.equal(response.toString(), sendValue.toString());
        });

        it("Adds funder to funders list", async () => {
            await funding.fund({ value: sendValue });
            const funder = await funding.getFunder(0);
            assert.equal(funder, deployer);
        });
    });

    describe("withdraw", async () => {
        beforeEach(async () => {
            await funding.fund({ value: sendValue });
        });

        it("Withdraw ETH from founder", async () => {
            // Arrange
            const startingFundingBalance = await funding.provider.getBalance(funding.address);
            const startingDeployerBalance = await funding.provider.getBalance(deployer);

            //Act
            const txResponse = await funding.withdraw();
            const txReceipt = await txResponse.wait(1);
            const { gasUsed, effectiveGasPrice } = txReceipt;
            const gasCost = gasUsed.mul(effectiveGasPrice);
            const endingFundingBalance = await funding.provider.getBalance(funding.address);
            const endingDeployerBalance = await funding.provider.getBalance(deployer);

            //Assert
            assert.equal(endingFundingBalance, 0);
            assert.equal(
                startingFundingBalance.add(startingDeployerBalance),
                endingDeployerBalance.add(gasCost).toString()
            );
        });
    });
});
