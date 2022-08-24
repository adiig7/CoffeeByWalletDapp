const hre = require("hardhat");

//returns the balance of a given address
async function getBalance(address) {
    const balanceBigInt = await hre.waffle.provider.getBalance(address);
    return hre.ethers.utils.formatEther(balanceBigInt);
}

// prints the balances for a list of address
async function printBalances(addresses) {
    let idx = 0;
    for (const address of addresses) {
        console.log(`Address ${idx} balance: `, await getBalance(address));
        idx++;
    }
}

    async function printGifts(gifts) {
        for (const gift of gifts) {
            const timestamp = gift.timestamp;
            const name = gift.name;
            const message = gift.message;
            const senderAddress = gift.from;
            console.log(`At ${timestamp}, ${name} (${senderAddress}) said: ${message}`);
        }
    }
    async function main() {
        const [owner, tipper, tipper2, tipper3] = await hre.ethers.getSigners();
        const CoffeeByWallet = await hre.ethers.getContractFactory("CoffeeByWallet");
        const coffeeByWallet = await CoffeeByWallet.deploy();

        await coffeeByWallet.deployed();
        console.log("Contract deployed to: " + coffeeByWallet.address);

        const addresses = [owner.address, tipper.address, coffeeByWallet.address];

        console.log("== balances before giving the tip ==");
        await printBalances(addresses);

        const tip = {
            value: hre.ethers.utils.parseEther("1")
        };
        await coffeeByWallet.connect(tipper).BuyCoffee("Smith", "Thank you for the course!", tip);
        await coffeeByWallet.connect(tipper2).BuyCoffee("Angel", "Thank you for the shoutout!", tip);
        await coffeeByWallet.connect(tipper3).BuyCoffee("Kevin", "Thank you for the help!", tip);

        console.log("balances after giving the tip:");
        await printBalances(addresses);

        await coffeeByWallet.connect(owner).withdraw();

        // Check balances after withdrawal.
        console.log("== withdrawTips ==");
        await printBalances(addresses);

        console.log("Gifts");
        const gifts = await coffeeByWallet.getGifts();
        printGifts(gifts);
    }

 main()
     .then(() => process.exit(0))
     .catch((error) => {
         console.log(error);
         process.exit(1);
     })