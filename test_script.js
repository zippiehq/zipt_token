const Web3 = require('web3');
const solc = require('solc');
const fs = require('fs');
const lineReader = require('line-reader');

const readline = require('readline');

const BATCH_SIZE = 3;

function findImports(path) {
    return {
        'contents': fs.readFileSync(path).toString()
    }
}

var web3 = new Web3('http://localhost:9545')
var code = fs.readFileSync('./contracts/ZipToken.sol').toString();
var inputs = {
    'ZipToken.sol': fs.readFileSync('./contracts/ZipToken.sol').toString(),
};

var compiledCode = solc.compile({ sources: inputs }, 1, findImports);
var abiDefinition = JSON.parse(compiledCode.contracts['ZipToken.sol:ZipToken'].interface);
var contract = new web3.eth.Contract(abiDefinition);
var byteCode = compiledCode.contracts['ZipToken.sol:ZipToken'].bytecode;

web3.eth.getAccounts().then((accounts) => {
    contract.deploy({ data: byteCode }).send({ from: accounts[0], gas: 4700000 })
        .on('receipt', (receipt) => {
            console.log('deployed at ' + receipt.contractAddress)
            contract.options.address = receipt.contractAddress
            var addresses = [];
            var values = [];


            async function distribute() {
                await contract.methods.distributeTokens(addresses, values).send({ from: accounts[0], gas: 4700000 }).on('confirmation', (confirmationNumber, receipt) => {
                    if (confirmationNumber == 0) {
                        return new Promise(function(resolve, reject) {
                            addresses.forEach(address => {
                                contract.methods.balanceOf(address).call({ from: accounts[0] }).then((result) => {
                                    console.log('balance of' + address + 'is ' + result);
                                });
                            });
                        });
                    }
                })
            }


            var counter = 0;
            lineReader.eachLine('sampledata.txt', async function (line, last) {
                counter++;
                let address = line.split(',')[0];
                let value = line.split(',')[1];
                addresses.push(address);
                values.push(value);
                if ((counter % BATCH_SIZE) == 0) {
                    await distribute(addresses, values);
                    addresses = [];
                    values = [];
                }
                if (last) {
                    await distribute(addresses, values);
                    contract.methods.pause().send({ from: accounts[0], gas: 4700000 }).then(async function (receipt) {
                        console.log("Done!");
                        let ownerBalance = await contract.methods.balanceOf(accounts[0]).call({ from: accounts[0] });
                        console.log('Owner account balance is: ' + ownerBalance);
                    });
                }
            });

        });
});
