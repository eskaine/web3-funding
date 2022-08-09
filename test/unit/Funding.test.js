const { deployments, ethers, getNamedAccounts } = require("hardhat");
const { assert, expect } = require("chai");
const { devChains } = require("../../helper-hardhat-config");

!devChains.includes(network.name)
    ? describe.skip
    : describe("Funding", async () => {
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

          describe("Constructor", async () => {
              it("Sets aggregator address", async () => {
                  const response = await funding.getPriceFeed();
                  assert.equal(response, mockV3Aggregator.address);
              });
          });

          describe("Fund", async () => {
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

          describe("Withdraw", async () => {
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

              it("Multiple withdrawals", async () => {
                  // Arrange
                  const accounts = await ethers.getSigners();

                  for (let i = 1; i < 6; i++) {
                      const connectedContract = await funding.connect(accounts[i]);
                      await connectedContract.fund({ value: sendValue });
                  }

                  const startingFundingBalance = await funding.provider.getBalance(funding.address);
                  const startingDeployerBalance = await funding.provider.getBalance(deployer);

                  // Act
                  const txResponse = await funding.withdraw();
                  const txReceipt = await txResponse.wait(1);
                  const { gasUsed, effectiveGasPrice } = txReceipt;
                  const gasCost = gasUsed.mul(effectiveGasPrice);
                  const endingFundingBalance = await funding.provider.getBalance(funding.address);
                  const endingDeployerBalance = await funding.provider.getBalance(deployer);

                  // Assert
                  assert.equal(endingFundingBalance, 0);
                  assert.equal(
                      startingFundingBalance.add(startingDeployerBalance),
                      endingDeployerBalance.add(gasCost).toString()
                  );

                  // Ensure that funders are reset
                  await expect(funding.getFunder(0)).to.be.reverted;

                  for (let i = 1; i < 6; i++) {
                      assert.equal(await funding.getAddressToAmountFunded(accounts[i].address), 0);
                  }
              });

              it("Only owner can withdraw", async () => {
                  const accounts = await ethers.getSigners();
                  const nonOwner = await funding.connect(accounts[1]);
                  await expect(nonOwner.withdraw()).to.be.revertedWithCustomError;
              });
          });
      });
