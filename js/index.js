var enumAssetTypes = {
  UNKNOWN: 0,
  PLANT: 1,
  PACKAGE: 2,
};

var assetTypes = [
    {
      state_name: 'UNKNOWN',
      state_enum:  enumAssetTypes.UNKNOWN
    },{
      state_name: 'PLANT',
      state_enum:  enumAssetTypes.PLANT
    },{
      state_name: 'PACKAGE',
      state_enum:  enumAssetTypes.PACKAGE
    }
];

var asset = {
  unique_id: '',
  type: '',
  state: '',
  creation_time: '',
  last_update_time: '',
  transaction_list: [],
};

var assets = [];
var assetTypeName = 'PLANT';

var op_string = 'No Pending Op';

// debug event handlers
var addEvent = contractInstance.TestOutputStringEvent();
addEvent.watch(function(error,result){
    if(!error){
        //console.log("TestOutputStringEvent ", result, " tx_hash: ", result.transactionHash);
        //console.log("args ",result.args);
    }else{
        console.log(error);
    }
});
var addEvent = contractInstance.TestOutputBytes32Event();
addEvent.watch(function(error,result){
    if(!error){
        console.log("TestOutputBytes32Event ", result);
        console.log("args ",result.args);
    }else{
        console.log(error);
    }
});
var addEvent = contractInstance.TestOutputIntEvent();
addEvent.watch(function(error,result){
    if(!error){
        console.log("TestOutputIntEvent ", result);
        console.log("args ",result.args);
    }else{
        console.log(error);
    }
});

var addEvent = contractInstance.AYTEvent();
addEvent.watch(function(error,result){
    if(!error){
      console.log("AYTEvent ", result);
      console.log("args ",result.args);
      console.log("AYT Complete");
      op_string =  "AYT Complete";
      var obj = document.getElementById("asset_op_info");
      if (obj && typeof(obj) !== 'undefined') {
        obj.value = op_string;
      }
    } else {
      console.log(error);
    }
});

function getTrans(){
  var trans_hash = document.getElementById('result_field').value.toString();
  web3.eth.getTransaction(trans_hash.toString(), function(error, result){
       if(!error)
         console.log("result: ",result);
       else
          console.error("error: ",error);
  });
}

function getTransByTxID(trans_hash){
  web3.eth.getTransaction(trans_hash.toString(), function(error, result){
       if(!error){
         console.log("result: ",result);
         var alert_stg = web3.toAscii(result.input);
         alert(alert_stg);
       }else{
          console.error("error: ",error);
      }
  });
}

function ayt(){
  console.log("Pending AYT");
  op_string =  "Pending AYT";
  document.getElementById("asset_op_info").value = op_string;
  contractInstance.AYT({from: web3.eth.accounts[0]}, function(result) {
  });
}

function writeJSON(){
  writeJSONHandler('/proto/data/users.txt', users);
  //var bogus_plants = [];
  writeJSONHandler('/proto/data/plants.txt', plants);
  var batch_packages = packages.filter(function(pkg){
     return pkg.asset_type === "BATCH_PACKAGE";
  });
  console.log(batch_packages);
  //var bogus_packages = [];
  writeJSONHandler('/proto/data/packages.txt', batch_packages);
}

function readJSON(){
  op_string = "Loading Assets";
  document.getElementById("asset_op_info").value = op_string;
  readJSONHandler('/proto/data/users.txt', 'users');
  readJSONHandler('/proto/data/plants.txt', 'plants');

  // ordering hack - this read has to be last in order for the drawAssetPage() to work "off async" ....
  readJSONHandler('/proto/data/packages.txt', 'packages');
}



function draw_inventory_stub(){
  plant_page_is_active = false;
  $(plant_page_div).html('');
  $(plant_controls_div).html('');

  plant_details_page_is_active = false;
  $(plant_details_page_div).html('');
  plant_welfare_page_is_active = false;
  $(plant_welfare_page_div).html('');

  package_page_is_active = false;
  $(package_page_div).html('');
  $(package_controls_div).html('');

  state_table_active = false;
  $(state_table_div).html('');

  user_page_active = false;
  $(user_page_div).html('');
  $(user_controls_div).html('');

  user_details_page_is_active = false;
  $(user_details_page_div).html('');

  asset_page_is_active = true;
  $(asset_div).html('');

  drawAssetPage();
}

var asset_div;
var asset_page_is_active = false;
function drawAssetPage(mode){
  asset_page_is_active = true;
  $(asset_div).html('');

  if(mode === 'reload'){
    assets.length = 0;
    if(global_plants && global_plants.length !== 0){
      plants = global_plants;
      plants.forEach(function(plant){
        assets.push(plant);
      });
    }
    if(global_packages && global_packages.length !== 0){
      packages = global_packages;
      packages.forEach(function(package){
        assets.push(package);
      });
    }
  }else{
    assets.length = 0;
    plants.forEach(function(plant){
      assets.push(plant);
    });
    packages.forEach(function(package){
      assets.push(package);
    });
  }


  // html = '<div class="row-btns">';
  // html += '<a href="#" onclick="drawAssetPage()" class="btn btn-success">Asset Page</a>';
  // html += '<a href="#" onclick="plantPage()" class="btn btn-success">Plant Page</a>';
  // html += '<a href="#" onclick="packagePage()" class="btn btn-success">Package Page</a>';
  // html += '<a href="#" onclick="facilityPage()" class="btn btn-success">Facility Page</a>';
  // html += '<a href="#" onclick="userPage()" class="btn btn-success">User Page</a>';
  // html += '<a href="#" onclick="writeJSON()" class="btn btn-danger">Save Assets</a>';
  // // html += '<a href="#" onclick="readJSON()" class="btn btn-danger">Load Assets</a>';
  // html += '<a href="#" onclick="stateInfoPage()" class="btn btn-primary">Domain Info</a>';
  // html += '<a href="#" onclick="ayt()" class="btn btn-info">AYT</a>';
  // html += '</div>';
  // $(asset_div).append(html);

  //var asset_caption = asset_div.appendChild(document.createElement('caption'));
  //var asset_title = asset_div.appendChild(document.createElement('span'));
  //asset_title.classList.add('h3');
  //asset_title.innerHTML = 'Asset Table';

  // var asset_table = asset_div.appendChild(document.createElement('table'));
  //asset_table.classList.add('table', 'table-bordered', 'table-condensed', 'table-hover', 'table-striped');

  var html = '';
  html += '<div class="table-title">';
  html += '<b>Asset Table</b>';
  html += '<input id="asset_op_info" disabled type="text name="Operation">';
  html += '</div>';
  html += '<table class="table table-bordered table-striped" id="asset_table">';

  html += '<tr><th>No.</th><th>ID</th><th>Creation</th><th>Type</th><th>Currrent State</th><th>Last Update</th></tr>'; //'<th>Details</th></tr>';  // Type, ID, creation, state, last update

  if(assets.length > 0){
    var count = '';
    var package_count = 0;
    var plant_count = 0;
    assets.forEach(function(asset){
      if(asset.asset_type === "PLANT"){
        plant_count++;
        count = plant_count;
      }else if(asset.asset_type === "PACKAGE"){
        package_count++;
        count = package_count;
      }
      html += '<tr><td>'+count+'</td><td>'+asset.unique_id+'</td><td>'+convertTimeLocal(asset.creation_time)+'</td><td>'+asset.asset_type+'</td><td>'+asset.state+'</td><td>'+convertTimeLocal(asset.last_update_time)+'</td>';
      //html += '<td><button id="' + asset.unique_id + '" class="btn btn-primary" onclick="provenancePage(\'' + asset.unique_id + '\')"><span class="glyphicon glyphicon-tint"></span>&nbsp;Details</button></td>';
      html += '</tr>';
    });
  }
  html += '</table>';
  
  // $(asset_table).append(html);
  $(asset_div).append(html);

  var rowObj = document.createElement('div');
  rowObj.className = 'row-btns';
  asset_div.appendChild(rowObj);

/*
  var asset_controls = asset_div.appendChild(document.createElement('div'));
  html = '';

  html += '<a href="#" onclick="drawAssetPage()" class="btn btn-success">Asset Page</a>';
  html += '<a href="#" onclick="plantPage()" class="btn btn-success">Plant Page</a>';
  html += '<a href="#" onclick="packagePage()" class="btn btn-success">Package Page</a>';
  //html += '<a href="#" onclick="facilityPage()" class="btn btn-success">Facility Page</a>';
  html += '<a href="#" onclick="userPage()" class="btn btn-success">User Page</a>';
  html += '<a href="#" onclick="writeJSON()" class="btn btn-danger">Save Assets</a>';
  html += '<a href="#" onclick="readJSON()" class="btn btn-danger">Load Assets</a>';
  html += '<a href="#" onclick="stateInfoPage()" class="btn btn-primary">Domain Info</a>';
  html += '<a href="#" onclick="ayt()" class="btn btn-info">AYT</a>';
  $(asset_controls).append(html);
*/

  document.getElementById("asset_op_info").value = op_string;
}

$(document).ready(function() {
  var tag = "main_form_" + new Date().getTime();
  document.getElementById('main').innerHTML = '<div id="' + tag + '" class="container"></div>';
  var element = document.getElementById(tag);

  globalUser = {
    unique_id: '46c1e3ebbbbbfddf8266c76206910bcf',
    role:  0,
    facility:  'Facility 1'
  };
  users.push(globalUser);

  app_container_top = element.appendChild(document.createElement('div'));
  asset_div = app_container_top.appendChild(document.createElement('div'));

  // app_container_top = element.appendChild(document.createElement('div'));
  // asset_div = app_container_top.appendChild(document.createElement('div'));

  drawAssetPage();

  readJSON();

});
