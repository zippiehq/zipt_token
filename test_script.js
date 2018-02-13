const Web3 = require('web3');
const solc = require('solc');
const fs = require('fs');
const lineReader = require('line-reader');

const readline = require('readline');

function findImports(path) {
    return {
        'contents': fs.readFileSync(path).toString()
    }
}


var web3 = new Web3('http://localhost:8545')
code = fs.readFileSync('./contracts/ZipToken.sol').toString();
var inputs = {
    'ZipToken.sol': fs.readFileSync('./contracts/ZipToken.sol').toString(),
};

compiledCode = solc.compile({sources: inputs}, 1, findImports);
abiDefinition = JSON.parse(compiledCode.contracts['ZipToken.sol:ZipToken'].interface);
contract = new web3.eth.Contract(abiDefinition);
byteCode = compiledCode.contracts['ZipToken.sol:ZipToken'].bytecode;

web3.eth.getAccounts().then((accounts) => {
  contract.deploy({ data: byteCode }).send({ from: accounts[0], gas: 4700000})
  .on('receipt', (receipt) => {
    console.log('deployed at ' + receipt.contractAddress)
    contract.options.address = receipt.contractAddress
    var addresses = [];
    var values = [];

    function distribute() {
       contract.methods.distributeTokens(addresses, values).send({ from: accounts[0], gas: 4700000 }).on('confirmation', (confirmationNumber, receipt) => {
         if (confirmationNumber == 0)
         {
            contract.methods.balanceOf('0xf17f52151ebef6c7334fad080c5704d77216b732').call({ from: accounts[0] }).then((result) => {
              console.log('balance of 0xf17f52151ebef6c7334fad080c5704d77216b732 is ' + result)
            });
            contract.methods.balanceOf('0xc5fdf4076b8f3a5357c5e395ab970b5b54098fef').call({ from: accounts[0] }).then((result) => {
                console.log('balance of 0xc5fdf4076b8f3a5357c5e395ab970b5b54098fef is ' + result)
            });
            contract.methods.balanceOf('0x821aea9a577a9b44299b9c15c88cf3087f3b5544').call({ from: accounts[0] }).then((result) => {
                console.log('balance of 0x821aea9a577a9b44299b9c15c88cf3087f3b5544 is ' + result)
            });
            contract.methods.balanceOf('0x7eba904a3315a450f9e1a10fbd00a9270700fdf2').call({ from: accounts[0] }).then((result) => {
                console.log('balance of 0x7eba904a3315a450f9e1a10fbd00a9270700fdf2 is ' + result)
            });
         }
       })
    }

    lineReader.eachLine('sampledata.txt', function(line, last) {
      let address = line.split(',')[0];
      let value = line.split(',')[1];
      addresses.push(address);
      values.push(value);
      if(last){
          distribute();
      }
    });

  })
})