
import assertRevert from '../node_modules/zeppelin-solidity/test/helpers/assertRevert.js';

var ZipToken = artifacts.require('ZipToken');
const BigNumber = web3.BigNumber;

contract('ZipToken', function (accounts) {
  let token;
  let supply = new BigNumber('1000000000000000000000000000');

  beforeEach(async function () {
    token = await ZipToken.new();
  });

  it('should return the correct totalSupply after construction', async function () {
    let totalSupply = await token.totalSupply();

    assert.equal(totalSupply.toString(), supply.toString());
  });

  it('should return the correct allowance amount after approval', async function () {
    await token.approve(accounts[1], 100);
    let allowance = await token.allowance(accounts[0], accounts[1]);

    assert.equal(allowance, 100);
  });

  it('should return correct balances after transfer', async function () {
    await token.transfer(accounts[1], 100);
    let balance0 = await token.balanceOf(accounts[0]);
    assert.equal(balance0.toString(), supply.sub(100).toString());

    let balance1 = await token.balanceOf(accounts[1]);
    assert.equal(balance1.toString(), '100');
  });

  it('should throw an error when trying to transfer more than balance', async function () {
    let token = await ZipToken.new();
    await assertRevert(token.transfer(accounts[1], supply.plus(1)));
  });

  it('should return correct balances after transfering from another account', async function () {
    await token.approve(accounts[1], 100);
    await token.transferFrom(accounts[0], accounts[2], 100, { from: accounts[1] });

    let balance0 = await token.balanceOf(accounts[0]);
    assert.equal(balance0.toString(), supply.sub(100).toString());

    let balance1 = await token.balanceOf(accounts[2]);
    assert.equal(balance1.toString(), '100');

    let balance2 = await token.balanceOf(accounts[1]);
    assert.equal(balance2.toString(), '0');
  });

  it('should throw an error when trying to transfer more than allowed', async function () {
    await token.approve(accounts[1], 99);
    await assertRevert(token.transferFrom(accounts[0], accounts[2], 100, { from: accounts[1] }));
  });

  it('should throw an error when trying to transferFrom more than _from has', async function () {
    let balance0 = await token.balanceOf(accounts[0]);
    await token.approve(accounts[1], 99);
    await assertRevert(token.transferFrom(accounts[0], accounts[2], balance0.plus(1), { from: accounts[1] }));
  });

  describe('validating allowance updates to spender', function () {
    let preApproved;

    it('should start with zero', async function () {
      preApproved = await token.allowance(accounts[0], accounts[1]);
      assert.equal(preApproved, 0);
    });

    it('should increase by 50 then decrease by 10', async function () {
      await token.increaseApproval(accounts[1], 50);
      let postIncrease = await token.allowance(accounts[0], accounts[1]);
      assert(preApproved.plus(50).equals(postIncrease));
      await token.decreaseApproval(accounts[1], 10);
      let postDecrease = await token.allowance(accounts[0], accounts[1]);
      assert(postIncrease.minus(10).equals(postDecrease));
    });
  });

  it('should increase by 50 then set to 0 when decreasing by more than 50', async function () {
    await token.approve(accounts[1], 50);
    await token.decreaseApproval(accounts[1], 60);
    let postDecrease = await token.allowance(accounts[0], accounts[1]);
    assert.equal(postDecrease.toString(), '0');
  });

  it('should throw an error when trying to transfer to 0x0', async function () {
    await assertRevert(token.transfer(0x0, 100));
  });

  it('should throw an error when trying to transferFrom to 0x0', async function () {
    await token.approve(accounts[1], 100);
    await assertRevert(token.transferFrom(accounts[0], 0x0, 100, { from: accounts[1] }));
  });
});

