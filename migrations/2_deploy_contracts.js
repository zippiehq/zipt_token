var ZipToken = artifacts.require("ZipToken");
var ZipTokenMock = artifacts.require("ZipTokenMock");
var Vesting = artifacts.require('TokenVestingMock');
var MessageHelper = artifacts.require('MessageHelper');

module.exports = function(deployer, network, accounts) {
  deployer.deploy(ZipToken);
  deployer.deploy(ZipTokenMock);
  deployer.deploy(Vesting, accounts[0], 0, 0, 0, true);
  deployer.deploy(MessageHelper);
};