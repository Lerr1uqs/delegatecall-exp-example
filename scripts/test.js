const { ethers } = require("hardhat");
const { expect } = require("chai");

async function main() {
    // Deploy the  contract
    const MemoryExample = await ethers.getContractFactory("Storage");

    const memoryExample = await MemoryExample.deploy();
    await memoryExample.store(2);
    // console.log(await memoryExample.retrieve());
    const contractAddr = await memoryExample.getAddress();
    // await memoryExample.foo();

    // Get the storage at storage slot 0,1
    // error: TypeError: ethers.provider.getStorageAt is not a function => https://ethereum.stackexchange.com/questions/155332/typeerror-ethers-provider-getstorageat-is-not-a-function
    let f = (idx) => {
        return ethers.provider.getStorage(
            contractAddr,
            idx
        )
    }

    const slotBytesArray = new Array(3);
    for(let [idx, _] of slotBytesArray.entries()) {
        slotBytesArray[idx] = await f(idx);
    }

    // We are able to extract the values of the private variables
    console.log("slot0Bytes", slotBytesArray[0]);
    console.log("slot1Bytes", slotBytesArray[1]); 
    console.log("slot2Bytes", slotBytesArray[2]);

}

main().then(() => process.exit(0))
	  .catch((err) => {
	    console.error(err);
	    process.exit(1);
	  })