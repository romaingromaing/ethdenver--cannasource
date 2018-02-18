
var Web3 = require('web3')
var web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:9545"));

var solc = require('solc');
var fs = require('fs');

var input = {
    'strings.sol': fs.readFileSync('contracts/strings.sol', 'utf8'),
    'MITSContract.sol': fs.readFileSync('contracts/MITSContract.sol', 'utf8'),
};
let compiledContract = solc.compile({sources: input}, 1);
console.log(compiledContract.contracts['MITSContract.sol:MITSContract'].interface);
