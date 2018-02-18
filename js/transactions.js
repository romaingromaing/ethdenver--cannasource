
var red_color = '#C70039';
var green_color = '#3B9440';
var gray_color = '#CBC3C3';
var orange_color = '#FFC300';
var blue_color = '#2980B9';

var enumTransactionResultStates = {
  INCOMPLETE: 0,
  ALLOWED: 1,
  NOT_ALLOWED: 2,
};

var transactionResultStates = [
  {
    state_name: 'INCOMPLETE',
    state_enum:  enumTransactionResultStates.INCOMPLETE,
    state_color: orange_color
  },{
    state_name: 'ALLOWED',
    state_enum:  enumTransactionResultStates.ALLOWED,
    state_color: green_color
  },{
    state_name: 'NOT_ALLOWED',
    state_enum:  enumTransactionResultStates.NOT_ALLOWED,
    state_color: red_color
  }
];

var enumTransactionClasses = {
  INCOMPLETE: 0,
  PLANT: 1,
  PACKAGE: 2,
  USER: 3,
};
var transactionClasses = [
  {
    state_name: 'INCOMPLETE',
    state_enum:  enumTransactionClasses.INCOMPLETE,
    state_color: orange_color
  },{
    state_name: 'PLANT',
    state_enum:  enumTransactionClasses.PLANT,
    state_color: green_color
  },{
    state_name: 'PACKAGE',
    state_enum:  enumTransactionClasses.PACKAGE,
    state_color: red_color
  },{
    state_name: 'USER',
    state_enum:  enumTransactionClasses.USER,
    state_color: red_color
  }
];

var attempt_stg = '';

var transaction_summary = {
  tx_hash: '',
  tx_time: '',
  asset_id: '',
  attempt: '',
  result: '',
  tx_class: '',
  tx_ee: '',
};

function uuid() {
    function s4() {
        return Math.floor((1 + Math.random()) * 0x10000)
                .toString(16)
                .substring(1);
    }
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
            s4() + '-' + s4() + s4() + s4();
}

function uuid_hex() {
    function s4() {
        return Math.floor((1 + Math.random()) * 0x10000)
                .toString(16)
                .substring(1);
    }
    return s4() + s4() + s4() + s4() +
            s4() + s4() + s4() + s4();
}


function findStateName(desiredStates, activeState){
  var state_name = '';
  var state_item = desiredStates.find(function(state){
    return state.state_enum === activeState;
  });
  state_name = state_item.state_name;
  return state_name;
}

function findStateEnum(desiredStates, activeStateName){
  var state_name = '';
  var state_item = desiredStates.find(function(state){
    return state.state_name === activeStateName;
  });
  state_enum = state_item.state_enum;
  return state_enum;
}

function findStateColor(desiredStates, activeStateName){
  var state_item = desiredStates.find(function(state){
    return state.state_name === activeStateName;
  });
  state_color = state_item.state_color;
  return state_color;
}

function convertTimeLocal(time) {
    var d = new Date(time * 1000.0);
    return d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate() +
            " " + d.getHours().toString().lpad("0", 2) + ":" + d.getMinutes().toString().lpad("0", 2) + ":" + d.getSeconds().toString().lpad("0", 2);
}

String.prototype.lpad = function (padString, length) {
    var str = this;
    while (str.length < length) {
        str = padString + str;
    }
    return str;
};
