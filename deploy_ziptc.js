const Web3 = require('web3');
const solc = require('solc');
const fs = require('fs');
const lineReader = require('line-reader');
const BigNumber = require('bignumber.js');

const readline = require('readline');

const BATCH_SIZE = 20;

function findImports(path) {
    return {
        'contents': fs.readFileSync(path).toString()
    }
}

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
{
    console.log(accounts)
    /* contract.options.address = '0x1292e61e53d9c176b552cb296affe3b852a74629'
    contract.methods.die().send({ from: accounts[0], gas: 500000 }).then(async function (receipt) {
                        console.log(receipt)
                        console.log("Dead n done!");
                    });    */
    contract.deploy({ data: '0x' + byteCode }).send({ from: accounts[0], gas: 3700000})
        .on('receipt', (receipt) => {
            console.log(receipt)
            console.log('deployed at ' + receipt.contractAddress)
            contract.options.address = receipt.contractAddress
            var addresses = [];
            var values = [];


            async function distribute() {
                await contract.methods.distributeTokens(addresses, values).send({ from: accounts[0], gas: 900000 }).on('confirmation', (confirmationNumber, receipt) => {
                    if (confirmationNumber == 0) {
                        console.log(receipt)
                        return new Promise(function(resolve, reject) {
                            addresses.forEach(address => {
                                contract.methods.balanceOf(address).call({ from: accounts[0] }).then((result) => {
                                    console.log('balance of ' + address + ' is ' + result);
                                });
                            });
                        });
                    }
                })
            }


            var counter = 0;
            lineReader.eachLine('ziptc.txt', async function (line, last) {
                counter++;
                let address = line.split(',')[0];
                let value = line.split(',')[1];
                addresses.push(address);
                var b = new BigNumber(value)
                b = b.times('1000000000000000000')

                values.push(b);
                if ((counter % BATCH_SIZE) == 0) {
                    await distribute(addresses, values);
                    addresses = [];
                    values = [];
                }
                if (last) {
                    await distribute(addresses, values);
                    contract.methods.pause().send({ from: accounts[0], gas: 500000 }).then(async function (receipt) {
                        console.log(receipt)
                        console.log("Pausing done!");
                        let ownerBalance = await contract.methods.balanceOf(accounts[0]).call({ from: accounts[0] });
                        console.log('Owner account balance is: ' + ownerBalance);
                    });
                }
            });

        }); 
}
