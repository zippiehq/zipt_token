pragma solidity ^0.4.17;
import '../node_modules/zeppelin-solidity/contracts/token/ERC20/PausableToken.sol';
    
contract ZipTokenMock is PausableToken {
    string public constant NAME = "ZipperToken";
    string public constant SYMBOL = "ZIP";
    uint8 public constant DECIMALS = 0;
    uint public constant TOTAL_TOKEN_AMOUNT = 100;
    uint public constant INITIAL_SUPPLY = TOTAL_TOKEN_AMOUNT * 10**uint(DECIMALS);

    function ZipTokenMock() public {
        totalSupply_ = INITIAL_SUPPLY;
        balances[msg.sender] = INITIAL_SUPPLY;
    }

     function distributeTokens(address[] addresses, uint[] values) public onlyOwner {
        require(addresses.length == values.length);
        for (uint i = 0; i < addresses.length; i++) {
            address a = addresses[i];
            uint v = values[i];
            if (balanceOf(a) == 0) {
                transfer(a, v);
            }
        }
    }
}