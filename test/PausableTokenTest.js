import assertRevert from '../node_modules/zeppelin-solidity/test/helpers/assertRevert.js';
import { BigNumber } from 'bignumber.js';
const PausableToken = artifacts.require('ZipToken');

contract('PausableToken', function ([_, owner, recipient, anotherAccount]) {
  let token;
  let supply;

  beforeEach(async function () {
    token = await PausableToken.new({ from: owner });
    supply = new BigNumber('1000000000000000000000000000')
  });

  describe('pause', function () {
    describe('when the sender is the token owner', function () {

      describe('when the token is unpaused', function () {
        it('pauses the token', async function () {
          await token.pause({ from: owner });

          const paused = await token.paused();
          assert.equal(paused, true);
        });

        it('emits a paused event', async function () {
          const { logs } = await token.pause({ from: owner });

          assert.equal(logs.length, 1);
          assert.equal(logs[0].event, 'Pause');
        });
      });

      describe('when the token is paused', function () {
        beforeEach(async function () {
          await token.pause({ from: owner });
        });

        it('reverts', async function () {
          await assertRevert(token.pause({ from: owner }));
        });
      });
    });

    describe('when the sender is not the token owner', function () {

      it('reverts', async function () {
        await assertRevert(token.pause({ from: anotherAccount }));
      });
    });
  });

  describe('unpause', function () {
    describe('when the sender is the token owner', function () {

      describe('when the token is paused', function () {
        beforeEach(async function () {
          await token.pause({ from: owner });
        });

        it('unpauses the token', async function () {
          await token.unpause({ from: owner });

          const paused = await token.paused();
          assert.equal(paused, false);
        });

        it('emits an unpaused event', async function () {
          const { logs } = await token.unpause({ from: owner });

          assert.equal(logs.length, 1);
          assert.equal(logs[0].event, 'Unpause');
        });
      });

      describe('when the token is unpaused', function () {
        it('reverts', async function () {
          await assertRevert(token.unpause({ from: owner }));
        });
      });
    });

    describe('when the sender is not the token owner', function () {

      it('reverts', async function () {
        await assertRevert(token.unpause({ from: anotherAccount }));
      });
    });
  });

  describe('pausable token', function () {

    describe('paused', function () {
      it('is not paused by default', async function () {
        const paused = await token.paused({ from: owner });

        assert.equal(paused, false);
      });

      it('is paused after being paused', async function () {
        await token.pause({ from: owner });
        const paused = await token.paused({ from: owner });

        assert.equal(paused, true);
      });

      it('is not paused after being paused and then unpaused', async function () {
        await token.pause({ from: owner });
        await token.unpause({ from: owner });
        const paused = await token.paused();

        assert.equal(paused, false);
      });
    });

    describe('transfer', function () {
      it('allows to transfer when unpaused', async function () {
        await token.transfer(recipient, 100, { from: owner });

        const senderBalance = await token.balanceOf(owner);
        assert.equal(senderBalance, supply - 100);

        const recipientBalance = await token.balanceOf(recipient);
        assert.equal(recipientBalance, 100);
      });

      it('allows to transfer when paused and then unpaused', async function () {
        await token.pause({ from: owner });
        await token.unpause({ from: owner });

        await token.transfer(recipient, 100, { from: owner });

        const senderBalance = await token.balanceOf(owner);
        assert.equal(senderBalance.toString(), supply.sub(100).toString());

        const recipientBalance = await token.balanceOf(recipient);
        assert.equal(recipientBalance.toString(), '100');
      });

      it('reverts when trying to transfer when paused', async function () {
        await token.pause({ from: owner });

        await assertRevert(token.transfer(recipient, 100, { from: owner }));
      });
    });

    describe('approve', function () {
      it('allows to approve when unpaused', async function () {
        await token.approve(anotherAccount, 40, { from: owner });

        const allowance = await token.allowance(owner, anotherAccount);
        assert.equal(allowance, 40);
      });

      it('allows to transfer when paused and then unpaused', async function () {
        await token.pause({ from: owner });
        await token.unpause({ from: owner });

        await token.approve(anotherAccount, 40, { from: owner });

        const allowance = await token.allowance(owner, anotherAccount);
        assert.equal(allowance, 40);
      });

      it('reverts when trying to transfer when paused', async function () {
        await token.pause({ from: owner });

        await assertRevert(token.approve(anotherAccount, 40, { from: owner }));
      });
    });

    describe('transfer from', function () {
      beforeEach(async function () {
        await token.approve(anotherAccount, 50, { from: owner });
      });

      it('allows to transfer from when unpaused', async function () {
        await token.transferFrom(owner, recipient, 40, { from: anotherAccount });

        const senderBalance = await token.balanceOf(owner);
        assert.equal(senderBalance.toString(), supply.sub(40).toString());

        const recipientBalance = await token.balanceOf(recipient);
        assert.equal(recipientBalance.toString(), '40');
      });

      it('allows to transfer when paused and then unpaused', async function () {
        await token.pause({ from: owner });
        await token.unpause({ from: owner });

        await token.transferFrom(owner, recipient, 40, { from: anotherAccount });

        const senderBalance = await token.balanceOf(owner);
        assert.equal(senderBalance.toString(), supply.sub(40).toString());

        const recipientBalance = await token.balanceOf(recipient);
        assert.equal(recipientBalance.toString(), '40');
      });

      it('reverts when trying to transfer from when paused', async function () {
        await token.pause({ from: owner });

        await assertRevert(token.transferFrom(owner, recipient, 40, { from: anotherAccount }));
      });
    });

    describe('decrease approval', function () {
      beforeEach(async function () {
        await token.approve(anotherAccount, 100, { from: owner });
      });

      it('allows to decrease approval when unpaused', async function () {
        await token.decreaseApproval(anotherAccount, 40, { from: owner });

        const allowance = await token.allowance(owner, anotherAccount);
        assert.equal(allowance, 60);
      });

      it('allows to decrease approval when paused and then unpaused', async function () {
        await token.pause({ from: owner });
        await token.unpause({ from: owner });

        await token.decreaseApproval(anotherAccount, 40, { from: owner });

        const allowance = await token.allowance(owner, anotherAccount);
        assert.equal(allowance, 60);
      });

      it('reverts when trying to transfer when paused', async function () {
        await token.pause({ from: owner });

        await assertRevert(token.decreaseApproval(anotherAccount, 40, { from: owner }));
      });
    });

    describe('increase approval', function () {
      beforeEach(async function () {
        await token.approve(anotherAccount, 100, { from: owner });
      });

      it('allows to increase approval when unpaused', async function () {
        await token.increaseApproval(anotherAccount, 40, { from: owner });

        const allowance = await token.allowance(owner, anotherAccount);
        assert.equal(allowance, 140);
      });

      it('allows to increase approval when paused and then unpaused', async function () {
        await token.pause({ from: owner });
        await token.unpause({ from: owner });

        await token.increaseApproval(anotherAccount, 40, { from: owner });

        const allowance = await token.allowance(owner, anotherAccount);
        assert.equal(allowance, 140);
      });

      it('reverts when trying to increase approval when paused', async function () {
        await token.pause({ from: owner });

        await assertRevert(token.increaseApproval(anotherAccount, 40, { from: owner }));
      });
    });
  });
});