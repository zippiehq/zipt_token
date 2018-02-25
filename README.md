# ZipToken

Set up a testrpc node: npm run node
Run tests: npm run test
Flatten the ZipToken contract: npm run flatten

The aim is to:

Deploy the token with deploy_zipt.js script with a comma-seperated file with ETH address + ZIPT amount (with decimals). 

This will compile the contract w/ optimizer on, deploy it to the network, distribute tokens in batch fashion using distributeTokens() and
then pause the token. After that, the flattened version will be used to verify the contract source on etherscan.io

Once platform is ready, token is unpaused (transfers possible) and ownership of token moved to 0x000000000000 (or whatever makes sense) so
pausing is not possible in the future.

The comma-seperated file will contain several TokenVesting contracts already
deployed, TokenTimelocks and Gnosis multisigs https://github.com/gnosis/MultiSigWallet/blob/master/contracts/MultiSigWallet.sol) 

ZipToken827 is not planned to be used.

Questions? Poke carsten.munk@zipperglobal.com 
