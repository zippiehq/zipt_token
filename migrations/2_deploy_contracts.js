var ZipToken = artifacts.require("ZipToken");
var Vesting = artifacts.require('TokenVestingMock');
var MessageHelper = artifacts.require('MessageHelperMock');

module.exports = function(deployer, network, accounts) {
  deployer.deploy(ZipToken);
  deployer.deploy(Vesting, accounts[0], 0, 0, 0, true);
  deployer.deploy(MessageHelper);
};