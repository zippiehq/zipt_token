import latestTime from 'zeppelin-solidity/test/helpers/latestTime';
import { increaseTimeTo, duration } from 'zeppelin-solidity/test//helpers/increaseTime';
import assertRevert from '../node_modules/zeppelin-solidity/test/helpers/assertRevert.js';

var ZipToken = artifacts.require("./ZipTokenMock.sol");
var TokenVesting = artifacts.require("../node_modules/zeppelin-solidity/contracts/token/ERC20/TokenVesting.sol");
const lineReader = require('line-reader');


contract('ZipToken', function (accounts) {
  
  it("should put 100 ZIP in the owner's account.", async function () {
    const owner = accounts[0];
    const zip = await ZipToken.new({ from: owner });
    const totalSupply = await zip.totalSupply();
    assert(totalSupply.eq(100));
  });
  
  it("should distribute all tokens.", async function () {
    const owner = accounts[0];
    const zip = await ZipToken.new({ from: owner });
    var values = [];
    var addresses = [];
    lineReader.eachLine('sampledata.txt', async function(line, last) {
      let address = line.split(',')[0];
      let value = line.split(',')[1];
      addresses.push(address);
      values.push(value);
      if(last) {
        await zip.distributeTokens(addresses, values, { from: owner });
        var balance1 = await zip.balanceOf(addresses[0]);
        var balance2 = await zip.balanceOf(addresses[1]);
        var balance3 = await zip.balanceOf(addresses[2]);
        var balance4 = await zip.balanceOf(addresses[3]);
        var balanceOwner = await zip.balanceOf(owner);
        assert.equal(balance1.toString(), '10');
        assert.equal(balance2.toString(), '25');
        assert.equal(balance3.toString(), '50');
        assert.equal(balance4.toString(), '15');
        assert.equal(balanceOwner.toString(), '0');
      }
    });
  });

  it("should fail to distribute too many tokens.", async function () {
    const owner = accounts[0];
    const zip = await ZipToken.new({ from: owner });
    await assertRevert(zip.distributeTokens([accounts[1]], [101], { from: owner }));
  });
});