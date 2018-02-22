import latestTime from 'zeppelin-solidity/test/helpers/latestTime';
import { increaseTimeTo, duration } from 'zeppelin-solidity/test//helpers/increaseTime';
import assertRevert from '../node_modules/zeppelin-solidity/test/helpers/assertRevert.js';

var ZipToken = artifacts.require("ZipToken");
const lineReader = require('line-reader');
var BigNumber = web3.BigNumber;

contract('ZipToken', function (accounts) {
  
  beforeEach(async function () {
    this.owner = accounts[0];
    this.zip = await ZipToken.new({ from: accounts[0] });
    this.supply = new BigNumber('1000000000000000000000000000');
  });

  it("should put 1000000000 ZIP in the owner's account.", async function () {
    const ownerBalance = await this.zip.balanceOf(this.owner);
    assert.equal(ownerBalance.toString(), this.supply.toString());
  });

  it("should distribute all tokens.", async function () {
    var values = [];
    var addresses = [];
    var zip = this.zip;
    var owner = this.owner;
    lineReader.eachLine('sampledata.txt', async function (line, last) {
      let address = line.split(',')[0];
      let value = line.split(',')[1];
      value = new BigNumber(value);
      addresses.push(address);
      values.push(value);
      if (last) {
        await zip.distributeTokens(addresses, values, { from: owner });
        var balance1 = await zip.balanceOf(addresses[0]);
        var balance2 = await zip.balanceOf(addresses[1]);
        var balance3 = await zip.balanceOf(addresses[2]);
        var balance4 = await zip.balanceOf(addresses[3]);
        var balanceOwner = await zip.balanceOf(owner);
        assert.equal(balance1.toString(), '5e+26');
        assert.equal(balance2.toString(), '4.9999999999999999999999998e+26');
        assert.equal(balance3.toString(), '15');
        assert.equal(balance4.toString(), '5');
        assert.equal(balanceOwner.toString(), '0');
      }
    });
  });

  it("should fail to distribute too many tokens.", async function () {
    await assertRevert(this.zip.distributeTokens([accounts[1]], [this.supply.plus(1)], { from: this.owner }));
  });

  
});