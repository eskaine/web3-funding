require("@nomicfoundation/hardhat-toolbox");
require("@nomiclabs/hardhat-solhint");

const GOERLI_URL = process.env.GOERLI_URL || "";
const PRIVATEKEY = process.env.PRIVATEKEY;
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY || "";

module.exports = {
    solidity: "0.8.8",
    defaultNetwork: "hardhat",
    networks: {
        goerli: {
            url: GOERLI_URL,
            accounts: [PRIVATEKEY],
        },
    },
    gasReporter: {
        enabled: true,
        currency: "USD",
        outputFile: "gas-report.txt",
        noColors: true,
    },
    etherscan: {
        apiKey: ETHERSCAN_API_KEY,
    },
    namedAccounts: {
        deployer: {
            default: 0,
        },
    },
};
