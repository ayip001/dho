var readOnlyMethods = [
  {
    name: 'currentPrice',
    callback: function(err, result) {
      var currentPrice = web3.fromWei(result, 'ether').toString(10);
      $('#currentPrice-error').text(err);
      $('#currentPrice-result').text(currentPrice);
    }
  },
  { name: 'biddingOpen' },
  { name: 'getWinningBidder' }
];

var mutatingMethods = [
  { name: 'bid', payable: true },
  { name: 'finalize' },
  {
    name: 'overrideTime',
    inputs: [
      { name: 'time', type: 'number', label: 'time (blocks)' }
    ]
  },
  { name: 'clearTime' }
];

function initWeb3 () {
  if (typeof web3 !== 'undefined') {
    console.log('Injected web3 detected.')
    window.web3 = new Web3(web3.currentProvider);
  } else {
    console.log('No web3 instance injected, using Local web3.')
    window.web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:8545'));
  }
}

function initAccessContractForm () {
  $('#access-contract-form').submit(function(e) {
    e.preventDefault();
    var address = $('#access-address-input').val();
    var deployedContract = web3.eth.contract(JSON.parse(address.trim())).at(address);
    console.log('contract address:', deployedContract.address);
    console.log('deployed contract:', deployedContract);
    buildContractControls(deployedContract, readOnlyMethods, mutatingMethods);
  });
}

function initDeployContractForm () {
  $('#deploy-contract-form').submit(function(e) {
    e.preventDefault();
    var initialPrice = web3.toWei($('#deploy-initialPrice-input').val(), 'ether');
    var biddingPeriod = Number($('#deploy-biddingPeriod-input').val());
    var offerPriceDecrement = web3.toWei($('#deploy-offerPriceDecrement-input').val(), 'ether');
    var testMode = $('#deploy-testMode-input').prop('checked');

    var abi = JSON.parse($('#deploy-abi-input').val().trim());
    var bytecode = $('#deploy-bytecode-input').val().trim();
    var gas = Number($('#deploy-gas-input').val());

    var transactionObject = {data: '0x' + bytecode, from: web3.eth.coinbase, gas: gas};

    web3.eth.contract(abi).new(
      initialPrice,
      biddingPeriod,
      offerPriceDecrement,
      testMode,
      transactionObject,
      function(err, deployedContract) {
        if (!deployedContract.address) {
          console.log('txHash:', deployedContract.transactionHash)
        } else {
          console.log('contract address:', deployedContract.address);
          console.log('deployed contract:', deployedContract);
          buildContractControls(deployedContract, readOnlyMethods, mutatingMethods);
        }
      }
    )
  });
}

$(function() {
  $(window).load(function() {
    initWeb3();
    initAccessContractForm();
    initDeployContractForm();
    $('#contract-controls-container').hide();
  });
});