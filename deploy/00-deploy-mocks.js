const { network } = require("hardhat");
const { DECIMALS, INITIAL_ANSWER } = require("../helpers/networks.constant");

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments;
    const { deployer } = await getNamedAccounts();
    const chainId = network.config.chainId;

    if (chainId == 31337) {
        log("Deploying mocks to local network...");
        await deploy("MockV3Aggregator", {
            contract: "MockV3Aggregator",
            from: deployer,
            log: true,
            args: [DECIMALS, INITIAL_ANSWER],
        });
        log("Mocks deployed!!");
        log("________________________");
    }
};

module.exports.tags = ["all", "mocks"];
