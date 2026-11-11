// SPDX-License-Identifier: GPL-3.0
// Henry Lodge

pragma solidity >=0.8.2 <0.9.0;

contract LostChain {
    // VARS
    // num of reports/matches
    uint256 public numFoundReports;
    uint256 public numLostReports;
    uint256 public numMatches;
    // min reward to submit lost item report, couple of dollars
    uint256 public minReward = 0.001 ether;
    // reentrancy guard, prevent callback attacks
    bool private locked;
    
    // item attrs
    struct ItemDescription {
        // required fields
        bytes32 categoryFieldHash;
        bytes32 subcategoryFieldHash;
        bytes32 itemTypeFieldHash;
        bytes32 brandFieldHash;
        bytes32 colorFieldHash;
        bytes32 distinctFeaturesFieldHash; // not dropdown
        bytes32 locationFoundFieldHash; // not dropdown
    }
    
    // found item report attrs
    struct ReportFoundItem {
        uint256 id;
        ItemDescription itemDescriptions;
        address finderWalletAddress;
        uint256 dateFound;
        uint256 reportTimestamp;
        bytes32 salt;
        bool paid;
    }
    
    // lost item report attrs
    struct ReportLostItem {
        uint256 id;
        ItemDescription itemDescriptions;
        address ownerWalletAddress;
        uint256 ethRewardAmount;
        uint256 dateLost;
        uint256 reportTimestamp;
        bytes32 salt;
        bool matched;
        bool refunded;
    }
    
    // report match attrs
    struct LostFoundMatch {
        uint256 foundReportId;
        uint256 lostReportId;
        address finderAddress;
        address ownerAddress;
        uint256 ethRewardAmount;
        uint256 matchTimestamp;
        bool paid;
        bool confirmed;
    }
    
    // storing reports
    mapping(uint256 => ReportFoundItem) public foundReports;
    mapping(uint256 => ReportLostItem) public lostReports;
    mapping(uint256 => LostFoundMatch) public matches;
    mapping(uint256 => uint256[]) public foundReportMatches;
    mapping(uint256 => uint256[]) public lostReportMatches;
    
    // emit when user submits found item report
    event FoundReportSubmitted(
        uint256 indexed reportId,
        address indexed finder,
        uint256 dateFound,
        uint256 timestamp
    );
    // emit when user submits lost item report
    event LostReportSubmitted(
        uint256 indexed reportId,
        address indexed owner,
        uint256 reward,
        uint256 dateLost,
        uint256 timestamp
    );
    // emit when lost/found reports match
    event PotentialMatchFound(
        uint256 indexed foundReportId,
        uint256 indexed lostReportId,
        uint256 matchId,
        uint256 rewardAmount
    );
    // emit when lost/found exchange happens
    event MatchConfirmed(
        uint256 indexed matchId,
        address indexed confirmedBy
    );
    // emit when user submits found item report
    event RewardPaid(
        uint256 indexed matchId,
        address indexed finder,
        uint256 amount
    );
    // emit when staked eth gets refunded
    event RewardRefunded(
        uint256 indexed lostReportId,
        address indexed owner,
        uint256 amount
    );
    
    // prevent attacks
    // use in every function that transfers ETH from wallets/contracts
    // check if unlocked, lock, allow function to run, unlock
    modifier nonReentrant() {
        require(!locked);
        locked = true;
        _;
        locked = false;
    }
    
    // FUNCTIONS
    // create found item report
    function reportFoundItem(
        bytes32 categoryFieldHash,
        bytes32 subcategoryFieldHash,
        bytes32 itemTypeFieldHash,
        bytes32 brandFieldHash,
        bytes32 colorFieldHash,
        bytes32 distinctFeaturesFieldHash,
        bytes32 locationFoundFieldHash,
        uint256 dateFound,
        bytes32 salt
    ) external returns (uint256) {
        // make sure required fields are filled valid
        require(categoryFieldHash != bytes32(0));
        require(subcategoryFieldHash != bytes32(0));
        require(itemTypeFieldHash != bytes32(0));
        require(brandFieldHash != bytes32(0));
        require(colorFieldHash != bytes32(0));
        require(distinctFeaturesFieldHash != bytes32(0));
        require(locationFoundFieldHash != bytes32(0));
        require(dateFound > 0 && dateFound <= block.timestamp);
        require(salt != bytes32(0));
        
        // increm report id num
        numFoundReports++;
        uint256 reportId = numFoundReports;
        
        // store report
        foundReports[reportId] = ReportFoundItem({
            id: reportId,
            itemDescriptions: ItemDescription({
                categoryFieldHash: categoryFieldHash,
                subcategoryFieldHash: subcategoryFieldHash,
                itemTypeFieldHash: itemTypeFieldHash,
                brandFieldHash: brandFieldHash,
                colorFieldHash: colorFieldHash,
                distinctFeaturesFieldHash: distinctFeaturesFieldHash,
                locationFoundFieldHash: locationFoundFieldHash
            }),
            finderWalletAddress: msg.sender,
            dateFound: dateFound,
            reportTimestamp: block.timestamp,
            salt: salt,
            paid: false
        });
        
        // emit
        emit FoundReportSubmitted(
            reportId,
            msg.sender,
            dateFound,
            block.timestamp
        );
        
        checkForMatches(reportId, true);
        // return id num
        return reportId;
    }
    
    // create lost item report, take ETH out of reporter wallet and lock
    function reportLostItem(
        bytes32 categoryFieldHash,
        bytes32 subcategoryFieldHash,
        bytes32 itemTypeFieldHash,
        bytes32 brandFieldHash,
        bytes32 colorFieldHash,
        bytes32 distinctFeaturesFieldHash,
        bytes32 locationFoundFieldHash,
        uint256 dateLost,
        bytes32 salt
    ) external payable nonReentrant returns (uint256) {
        // make sure required fields are filled and valid
        require(msg.value >= minReward, "Reward must be at least 0.001 ETH");
        require(categoryFieldHash != bytes32(0));
        require(subcategoryFieldHash != bytes32(0));
        require(itemTypeFieldHash != bytes32(0));
        require(brandFieldHash != bytes32(0));
        require(colorFieldHash != bytes32(0));
        require(distinctFeaturesFieldHash != bytes32(0));
        require(locationFoundFieldHash != bytes32(0));
        require(dateLost > 0 && dateLost <= block.timestamp);
        require(salt != bytes32(0));
        
        // eth locked in contract
        
        // increm report id num
        numLostReports++;
        uint256 reportId = numLostReports;
        
        // store report
        lostReports[reportId] = ReportLostItem({
            id: reportId,
            itemDescriptions: ItemDescription({
                categoryFieldHash: categoryFieldHash,
                subcategoryFieldHash: subcategoryFieldHash,
                itemTypeFieldHash: itemTypeFieldHash,
                brandFieldHash: brandFieldHash,
                colorFieldHash: colorFieldHash,
                distinctFeaturesFieldHash: distinctFeaturesFieldHash,
                locationFoundFieldHash: locationFoundFieldHash
            }),
            ownerWalletAddress: msg.sender,
            ethRewardAmount: msg.value,
            dateLost: dateLost,
            reportTimestamp: block.timestamp,
            salt: salt,
            matched: false,
            refunded: false
        });
        
        // emit
        emit LostReportSubmitted(
            reportId,
            msg.sender,
            msg.value,
            dateLost,
            block.timestamp
        );
        
        checkForMatches(reportId, false);
        // return id num
        return reportId;
    }
    
    // confirm the item exchange between lost/found parties
    function confirmExchange(uint256 matchId) external nonReentrant {
        LostFoundMatch storage matchData = matches[matchId];
        // check if match exists
        require(matchData.matchTimestamp > 0, "Match does not exist");
        require(!matchData.confirmed, "Already confirmed");
        require(!matchData.paid, "Already paid");
        require(
            msg.sender == matchData.finderAddress || 
            msg.sender == matchData.ownerAddress,
            "Not authorized"
        );
        
        // Mark as confirmed
        matchData.confirmed = true;
        
        // emit
        emit MatchConfirmed(matchId, msg.sender);
        
        // Release payment from escrow
        payFinder(matchId);
    }
    
    // cancel lost item report and get locked ETH back
    function cancelLostReport(uint256 lostReportId) external nonReentrant {
        ReportLostItem storage report = lostReports[lostReportId];
        // check if report even exists and not matched/refunded
        require(report.id != 0, "Report does not exist");
        require(report.ownerWalletAddress == msg.sender, "Not the owner");
        require(!report.matched, "Already matched - cannot refund");
        require(!report.refunded, "Already refunded");
        
        // Mark as refunded
        report.refunded = true;
        uint256 refundAmount = report.ethRewardAmount;
        report.ethRewardAmount = 0;
        
        // Release ETH from escrow back to owner
        (bool success, ) = msg.sender.call{value: refundAmount}("");
        require(success, "Refund failed");
        
        // emit
        emit RewardRefunded(lostReportId, msg.sender, refundAmount);
    }
    
    // look for lost/find report matches
    function checkForMatches(uint256 reportId, bool isFoundReport) internal {
        if (isFoundReport) {
            ReportFoundItem storage foundReport = foundReports[reportId];

            // iterate over all lost item reports
            for (uint256 i = 1; i <= numLostReports; i++) {
                ReportLostItem storage lostReport = lostReports[i];
                
                // Skip if already matched or refunded
                if (lostReport.matched || lostReport.refunded) continue;
                
                // check if lost/found item hashes match
                if (descriptionsMatch(
                    foundReport.itemDescriptions,
                    lostReport.itemDescriptions
                )) {
                    numMatches++;
                    
                    // Mark as matched
                    // lock eth
                    lostReport.matched = true;
                    
                    // store match
                    matches[numMatches] = LostFoundMatch({
                        foundReportId: reportId,
                        lostReportId: i,
                        finderAddress: foundReport.finderWalletAddress,
                        ownerAddress: lostReport.ownerWalletAddress,
                        ethRewardAmount: lostReport.ethRewardAmount,
                        matchTimestamp: block.timestamp,
                        paid: false,
                        // not confirmed until after both parties say so
                        confirmed: false
                    });
                    
                    foundReportMatches[reportId].push(i);
                    lostReportMatches[i].push(reportId);
                    
                    // emit
                    emit PotentialMatchFound(reportId, i, numMatches, lostReport.ethRewardAmount);
                    break;
                }
            }
        } else {
            ReportLostItem storage lostReport = lostReports[reportId];
            // iterate over all found item reports
            for (uint256 i = 1; i <= numFoundReports; i++) {
                ReportFoundItem storage foundReport = foundReports[i];
                
                // Skip if finder already paid
                if (foundReport.paid) continue;
                
                // check if descriptions match
                if (descriptionsMatch(
                    foundReport.itemDescriptions,
                    lostReport.itemDescriptions
                )) {
                    numMatches++;
                    
                    // Mark as matched (locks the escrow)
                    lostReport.matched = true;
                    
                    // store match
                    matches[numMatches] = LostFoundMatch({
                        foundReportId: i,
                        lostReportId: reportId,
                        finderAddress: foundReport.finderWalletAddress,
                        ownerAddress: lostReport.ownerWalletAddress,
                        ethRewardAmount: lostReport.ethRewardAmount,
                        matchTimestamp: block.timestamp,
                        paid: false,
                        confirmed: false
                    });
                    
                    foundReportMatches[i].push(reportId);
                    lostReportMatches[reportId].push(i);

                    // emit                    
                    emit PotentialMatchFound(i, reportId, numMatches, lostReport.ethRewardAmount);
                    break;
                }
            }
        }
    }
    
    // release ETH reward to finder, after confirming exchange
    function payFinder(uint256 matchId) internal {
        LostFoundMatch storage matchData = matches[matchId];
        require(!matchData.paid, "Already paid");
        
        ReportFoundItem storage foundReport = foundReports[matchData.foundReportId];
        
        matchData.paid = true;
        foundReport.paid = true;
        
        // Release ETH reward to finder 
        (bool success, ) = matchData.finderAddress.call{value: matchData.ethRewardAmount}("");
        require(success, "Payment failed");
        
        // emit
        emit RewardPaid(matchId, matchData.finderAddress, matchData.ethRewardAmount);
    }
    
    // check if report item descriptioin hashes match, return bool
    function descriptionsMatch(ItemDescription memory desc1,ItemDescription memory desc2) internal pure returns (bool) {
        return (
            desc1.categoryFieldHash == desc2.categoryFieldHash &&
            desc1.subcategoryFieldHash == desc2.subcategoryFieldHash &&
            desc1.itemTypeFieldHash == desc2.itemTypeFieldHash &&
            desc1.brandFieldHash == desc2.brandFieldHash &&
            desc1.colorFieldHash == desc2.colorFieldHash &&
            desc1.locationFoundFieldHash == desc2.locationFoundFieldHash &&
            (desc1.distinctFeaturesFieldHash == desc2.distinctFeaturesFieldHash ||
             desc1.distinctFeaturesFieldHash == bytes32(0) ||
             desc2.distinctFeaturesFieldHash == bytes32(0))
        );
    }
    
    // get item found report from store
    function getFoundReport(uint256 reportId) external view returns (ReportFoundItem memory) {
        return foundReports[reportId];
    }
    
    // get item lost report from store
    function getLostReport(uint256 reportId) external view returns (ReportLostItem memory) {
        return lostReports[reportId];
    }
    
    // get match from store
    function getMatch(uint256 matchId) external view returns (LostFoundMatch memory) {
        return matches[matchId];
    }
    
    // check ETH in escrow
    function getContractBalance() external view returns (uint256) {
        return address(this).balance;
    }
    
    // format all text in fields to be the same to prepare for hashing
    function formatTextForHashing(string memory str) internal pure returns (string memory) {
        bytes memory bStr = bytes(str);
        bytes memory result = new bytes(bStr.length);
        uint256 resultIndex = 0;
        
        for (uint256 i = 0; i < bStr.length; i++) {
            bytes1 char = bStr[i];
            
            if (char == 0x20) {
                continue;
            }
            
            if (uint8(char) >= 65 && uint8(char) <= 90) {
                result[resultIndex] = bytes1(uint8(char) + 32);
            } else {
                result[resultIndex] = char;
            }
            resultIndex++;
        }
        
        bytes memory finalResult = new bytes(resultIndex);
        for (uint256 i = 0; i < resultIndex; i++) {
            finalResult[i] = result[i];
        }
        
        return string(finalResult);
    }
    
    // hash all text with keccak256
    function hashText(string memory text) external pure returns (bytes32) {
        return keccak256(abi.encodePacked(formatTextForHashing(text)));
    }
}