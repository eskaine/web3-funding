const { ethers, getNamedAccounts } = require("hardhat");

async function main() {
    const { deployer } = await getNamedAccounts();
    const funding = await ethers.getContract("Funding", deployer);
    console.log("Funding contract...");
    const txResponse = await funding.withdraw();
    await txResponse.wait(1);
    console.log("Withdraw!");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
