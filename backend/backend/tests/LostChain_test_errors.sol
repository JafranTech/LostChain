// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.8.2 <0.9.0;

import "remix_tests.sol";
import "remix_accounts.sol";
import "../contracts/LostChain.sol";

contract LostChainEdgeTest {
    LostChain lostChain;
    
    bytes32 itemNameHash;
    bytes32 brandHash;
    bytes32 modelHash;
    bytes32 colorHash;
    bytes32 conditionHash;
    bytes32 locationHash;
    bytes32 distinctiveHash;
    bytes32 salt;
    
    /// #sender: account-0
    function beforeAll() public {
        lostChain = new LostChain();
        
        itemNameHash = lostChain.hashText("phone");
        brandHash = lostChain.hashText("samsung");
        modelHash = lostChain.hashText("galaxys23");
        colorHash = lostChain.hashText("white");
        conditionHash = lostChain.hashText("new");
        locationHash = lostChain.hashText("gym");
        distinctiveHash = lostChain.hashText("case");
        salt = keccak256(abi.encodePacked("test_salt"));
    }
    
    /// #sender: account-2
    /// #value: 100000000000000
    function test_RewardBelowMinimum() public payable {
        try lostChain.reportLostItem(
            itemNameHash,
            brandHash,
            modelHash,
            colorHash,
            conditionHash,
            locationHash,
            distinctiveHash,
            1699999000,
            salt
        ) {
            Assert.ok(false, "Should fail");
        } catch Error(string memory reason) {
            Assert.equal(reason, "Reward must be at least 0.001 ETH", "Correct error");
        } catch {
            Assert.ok(true, "Reverted");
        }
    }
    
    /// #sender: account-1
    function test_NonMatchingItems() public {
        lostChain.reportFoundItem(
            lostChain.hashText("laptop"),  // Different item
            brandHash,
            modelHash,
            colorHash,
            conditionHash,
            locationHash,
            distinctiveHash,
            1700000000,
            salt
        );
        
        Assert.equal(lostChain.numMatches(), 0, "No match should be created");
    }
}