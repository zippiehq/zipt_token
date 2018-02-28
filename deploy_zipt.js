const Web3 = require('web3');
const solc = require('solc');
const fs = require('fs');
const lineReader = require('line-reader');
const BigNumber = require('bignumber.js');

const readline = require('readline');
Promise = require('bluebird');

const BATCH_SIZE = 20;

function findImports(path) {
    return {
        'contents': fs.readFileSync(path).toString()
    }
}
//var web3 = new Web3('http://localhost:9545')

var web3 = new Web3('https://contribution.zipperglobal.com/eth')

var cw = web3.eth.accounts.privateKeyToAccount(process.argv[2])

web3.eth.accounts.wallet.add(cw)

var code = fs.readFileSync('./contracts/ZipToken.sol').toString();
var inputs = {
    'ZipToken.sol': fs.readFileSync('./contracts/ZipToken.sol').toString(),
};

var compiledCode = solc.compile({ sources: inputs }, 1, findImports);
var abiDefinition = JSON.parse(compiledCode.contracts['ZipToken.sol:ZipToken'].interface);
var contract = new web3.eth.Contract(abiDefinition);
var byteCode = compiledCode.contracts['ZipToken.sol:ZipToken'].bytecode;
console.log(byteCode)
accounts = [cw.address] 

var addresses = [];
var values = [];

lineReader.eachLine('ziptc.txt', function(line, last) {
  let address = line.split(',')[0];
  let value = line.split(',')[1];
  if (!web3.utils.isAddress(address)) {
    throw 'invalid address encountered'
  }
  addresses.push(address);
  var b = new BigNumber(value)
  b = b.times('1000000000000000000')
  values.push(b)
  if (last) {
//      web3.eth.getAccounts().then((accounts) => {
      contract.deploy({ data: '0x' + byteCode }).send({ from: accounts[0], gas: 3700000, gasPrice: 4000000000})
      .on('confirmation', async function(confNumber, receipt) {
        if (confNumber > 0)
          return
        console.log(receipt)
        console.log('deployed at ' + receipt.contractAddress)
        contract.options.address = receipt.contractAddress
        function distribute(addresses, values) {
          console.log('distributing ' + addresses)
          return contract.methods.distributeTokens(addresses.slice(0), values.slice(0)).send({ from: accounts[0], gas: 900000, gasPrice: 4000000000 })
        }
        var SPLIT_NUMBER = 20
        for (var i = 0; i < addresses.length; i += SPLIT_NUMBER) {
          let as = addresses.slice(i, (addresses.length - i) > SPLIT_NUMBER ? i + SPLIT_NUMBER : addresses.length)
          let vs = values.slice(i, (values.length - i) > SPLIT_NUMBER ? i + SPLIT_NUMBER : values.length)
          let receipt = await distribute(as, vs)
          console.log('distributed ' + as + JSON.stringify(receipt))
        }
        console.log('now pausing: ')
        contract.methods.pause().send({ from: accounts[0], gas: 200000, gasPrice: 4000000000 })
        .on('confirmation', async function(confNumber, receipt) {
           if (confNumber > 0)
             return
           console.log("Paused" + JSON.stringify(receipt));
           let ownerBalance = await contract.methods.balanceOf(accounts[0]).call({ from: accounts[0] })
           console.log('Owner account balance is: ' + ownerBalance);
        })
      })
//    })
  }
})

return

