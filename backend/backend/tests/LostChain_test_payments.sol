// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.8.2 <0.9.0;

import "remix_tests.sol";
import "remix_accounts.sol";
import "../contracts/LostChain.sol";

contract LostChainPaymentTest {
    LostChain lostChain;
    
    address bob;
    address alice;
    
    bytes32 itemNameHash;
    bytes32 brandHash;
    bytes32 modelHash;
    bytes32 colorHash;
    bytes32 conditionHash;
    bytes32 locationHash;
    bytes32 distinctiveHash;
    bytes32 bobSalt;
    bytes32 aliceSalt;
    
    /// #sender: account-0
    function beforeAll() public {
        lostChain = new LostChain();
        bob = TestsAccounts.getAccount(1);
        alice = TestsAccounts.getAccount(2);
        
        itemNameHash = lostChain.hashText("iphone");
        brandHash = lostChain.hashText("apple");
        modelHash = lostChain.hashText("iphone14pro");
        colorHash = lostChain.hashText("black");
        conditionHash = lostChain.hashText("crackedscreen");
        locationHash = lostChain.hashText("library");
        distinctiveHash = lostChain.hashText("bluecase");
        bobSalt = keccak256(abi.encodePacked("bob_salt"));
        aliceSalt = keccak256(abi.encodePacked("alice_salt"));
    }
    
    /// #sender: account-1
    function test1_SetupMatch() public {
        lostChain.reportFoundItem(
            itemNameHash,
            brandHash,
            modelHash,
            colorHash,
            conditionHash,
            locationHash,
            distinctiveHash,
            1700000000,
            bobSalt
        );
        Assert.ok(true, "Found report created");
    }
    
    /// #sender: account-2
    /// #value: 50000000000000000
    function test2_CreateMatch() public payable {
        lostChain.reportLostItem(
            itemNameHash,
            brandHash,
            modelHash,
            colorHash,
            conditionHash,
            locationHash,
            distinctiveHash,
            1699999000,
            aliceSalt
        );
        Assert.equal(lostChain.numMatches(), 1, "Match created");
    }
    
    /// #sender: account-1
    function test3_ConfirmAndPay() public {
        lostChain.confirmExchange(1);
        
        (,,,,,, bool paid, bool confirmed) = lostChain.matches(1);
        Assert.equal(confirmed, true, "Should be confirmed");
        Assert.equal(paid, true, "Should be paid");
        Assert.equal(lostChain.getContractBalance(), 0, "Escrow empty");
    }
}