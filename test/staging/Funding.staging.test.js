const { assert } = require("chai");
const { ethers, getNamedAccounts, network } = require("hardhat");
const { devChains } = require("../../helper-hardhat-config");

devChains.includes(network.name)
    ? describe.skip
    : describe("Funding", async () => {
          let funding;
          let deployer;
          const sendValue = ethers.utils.parseEther("1");
          beforeEach(async () => {
              deployer = (await getNamedAccounts()).deployer;
              funding = await ethers.getContract("Funding", deployer);
          });

          it("Allows funding and withdrawal", async () => {
              await funding.fund({ value: sendValue });
              await funding.withdraw();

              const endingBalance = await funding.provider.getBalance(funding.address);
              assert.equal(endingBalance.toString(), "0");
          });
      });
