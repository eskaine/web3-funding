import { NETWORKS } from "./helpers/networks.constant";

const networkConfig = {
    [NETWORKS.goerli]: {
        name: "goerli",
        ethUsdPriceFeed: "0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419",
    },
};

module.exports = {
    networkConfig,
};
