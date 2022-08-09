const { ethers, getNamedAccounts } = require("hardhat");

async function main() {
    const { deployer } = await getNamedAccounts();
    const funding = await ethers.getContract("Funding", deployer);
    console.log("Funding contract...");
    const txResponse = await funding.fund({
        value: ethers.utils.parseEther("0.1"),
    });
    await txResponse.wait(1);
    console.log("Funded!");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
