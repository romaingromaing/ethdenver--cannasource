var enumPackageStates = {
  CREATED_BATCH_PACKAGE: 0,
  INVENTORY: 1,
  ADDED_TO_MANIFEST: 2,
  DISPOSED: 3,
};

var packageStates = [
    {
      state_name: 'CREATED_BATCH_PACKAGE',
      state_enum:  enumPackageStates.CREATED_BATCH_PACKAGE
    },{
      state_name: 'INVENTORY',
      state_enum:  enumPackageStates.INVENTORY
    },{
      state_name: 'ADDED_TO_MANIFEST',
      state_enum:  enumPackageStates.ADDED_TO_MANIFEST
    },{
      state_name: 'DISPOSED',
      state_enum:  enumPackageStates.DISPOSED
    }
];

var package = {
  unique_id: '',
  asset_type: '',
  type: '',
  quantity: '',
  location: '',
  state: '',
  creation_time: '',
  last_update_time: '',
  transaction_list: [],
  plant_packages_list: [],
};

var packages = [];

var package_op_string = "No Pending Op";

function newPackage(){
    var pkg_plants = plants.filter(function(plant){
        return plant.state === "PACKAGED_TAGGED";
    });
    if(pkg_plants.length === 0){
        alert('No Plant Packages Selected to Batch');
        return;
    }
    var new_package = {
        unique_id: uuid_hex(),
        asset_type: "BATCH_PACKAGE",
        type: "Buds",
        quantity: '',
        strain: "Strain 1",
        location: "Room 2",
        state: "CREATED_BATCH_PACKAGE",
        creation_time: parseFloat(new Date().getTime() / 1000.0),
        last_update_time: parseFloat(new Date().getTime() / 1000.0),
        transaction_list: [],
        plant_packages_list: [],
    };

    pkg_plants.forEach(function(pkg){
        var id = 'include_'+pkg.unique_id;
        if(document.getElementById(id)){
            console.log(pkg.unique_id," include: ", document.getElementById(id).checked);
            if(document.getElementById(id).checked){
                pkg.state = "ADDED_TO_BATCH";
                console.log("packaged_plant: ",pkg);
                new_package.plant_packages_list.push(pkg);
                // stage state trans each pkg
            }
        }
    });
    console.log(new_package);

    attempt_stg = "CreateAsset,Package,ID," + new_package.unique_id + ",TXEE," + globalUser.unique_id;
    transaction_summary = {
        tx_hash: '',
        tx_time: '',
        asset_id: '',
        attempt: attempt_stg,
        result: 'Incomplete',
        tx_class: 'PACKAGE',
        tx_ee: globalUser.unique_id,
    };
    new_package.transaction_list.push(transaction_summary);
    return (new_package);
}

var addEvent = contractInstance.AddPackageAssetEvent();
addEvent.watch(function(error,result){
  if(!error){
    console.log("AddPackageAssetEvent ", result, " tx_hash: ", result.transactionHash);
    console.log("AddPackageAssetEvent args ",result.args.assetInfo);
    var result_elems = result.args.assetInfo.split(",");
    var elem_index = 0;
    result_elems.forEach(function(elem){
     console.log(elem_index,":",elem);
    });
    var active_asset = packages.find(function(package){
      return package.unique_id === result_elems[2];
    });
    if(active_asset){
      if(active_asset.transaction_list){
          var currentTrans = active_asset.transaction_list.find(function(trans){
            return trans.attempt.startsWith("CreateAsset,Package") && trans.result === "Incomplete";
          });
          //console.log(currentTrans);
          currentTrans.tx_hash = result.transactionHash;
          currentTrans.tx_time = parseFloat(new Date().getTime() / 1000.0);
          currentTrans.result = result.args.assetInfo;
          console.log(active_asset);
          package_op_string = "Add Package Complete";
          document.getElementById("package_op_info").value = package_op_string;
          //active_asset.plant_packages_list.forEach(function(plant){
            //queued_plant_state_list.length = 0;
            //queued_plant_state_list.push(plant);
            //testSetPlantState(queued_plant_state_list[0], "ADDED_TO_BATCH");
          //});
          packagePage();
      }else{
          console.log("No active_asset.transaction_list");
      }
    }else{
      console.log("asset not found for: ", result_elems[2]);
    }
  }else{
      console.log(error);
  }
});

var package_state_btn = false;
var addEvent = contractInstance.GetPackageStatesEvent();
addEvent.watch(function(error,result){
  if(!error){
    console.log("GetPackageStatesEvent ", result, " tx_hash: ", result.transactionHash);
    console.log("GetPackageStatesEvent args ",result.args.assetInfo);
    var result_elems = result.args.assetInfo.split(",");
    var elem_index = 0;
    var package_state_list = '';
    result_elems.forEach(function(elem){
     console.log(elem_index,":",elem);
     elem_index++;
     package_state_list += elem+"\n";
    });
    if(package_state_btn){
      alert(package_state_list);
      package_op_string = "Completed State List Request";
      if(document.getElementById("package_op_info")){
        document.getElementById("package_op_info").value = package_op_string;
      }
      package_state_btn = false;
    }
  }else{
      console.log(error);
  }
});

function getPackageStates() {
  package_state_btn = true; // hack to prevent old event from doing alert on reset
  package_op_string = "Pending State List Request";
  document.getElementById("package_op_info").value = package_op_string;
  contractInstance.GetPackageStates("GetPackageStates", globalUser.unique_id, {from: web3.eth.accounts[0], gas:4000000}, function(result) {
  });
}

var addEvent = contractInstance.SetPackageStateEvent();
addEvent.watch(function(error,result){
    if(!error){
        //console.log("SetPsckageStateEvent ", result);
        var result_elems = result.args.assetInfo.split(",");
        if(result_elems.length === 0){
          return;
        }
        var count = 0;
        result_elems.forEach(function(item){
            console.log(count," ", item);
            count++;
        });

        var id = result_elems[2];
        var process_category = result_elems[1];
        var previous_state = result_elems[4];
        var new_state_name =  result_elems[6];
        var active_asset = packages.find(function(asset){
          return asset.unique_id === id;
        });
        if(active_asset){
          //console.log("active_asset: ",active_asset);
        }else{
          console.log("asset not found for: ", result_elems[0]);
        }
        //console.log(process_category, " from :", previous_state, " to: ",new_state_name);
        if(active_asset && active_asset.transaction_list){
            active_asset.state = new_state_name;
            active_asset.last_update_time = parseFloat(new Date().getTime() / 1000.0);
            var currentTrans = active_asset.transaction_list.find(function(trans){
              return trans.attempt.startsWith("SetPackageState") && trans.result === "Incomplete";
            });
            if(currentTrans){
              currentTrans.tx_hash = result.transactionHash;
              currentTrans.tx_time = parseFloat(new Date().getTime() / 1000.0);
              currentTrans.result = result.args.assetInfo;
            }else{
                console.log("transaction not found for: ", process_category);
            }
            console.log(active_asset);
            package_op_string = "State Transition Complete";
            document.getElementById("package_op_info").value = package_op_string;
            provenancePackagePage(active_asset.unique_id);
        }else{
            console.log("No active_asset");
        }
    }else{
        console.log(error);
    }
});

function setPackageState(active_package, next_state) {
  current_systemState = active_package.state;
  var attempt_stg = "SetPackageState,ID,"+active_package.unique_id+',current,'+current_systemState+",next,"+next_state+",TXEE: " + globalUser.unique_id;
  console.log(attempt_stg);
  transaction_summary = {
    tx_hash: '',
    asset_id: active_package.unique_id,
    attempt: attempt_stg,
    result: 'Incomplete',
    tx_class: 'PACKAGE',
    tx_ee: globalUser.unique_id
  };
  active_package.transaction_list.push(transaction_summary);
  console.log(current_systemState, " ", next_state);
  console.log("SetPackageState", findStateEnum(packageStates, current_systemState), findStateEnum(packageStates, next_state), globalUser.unique_id);
  contractInstance.setPackageState(active_package.unique_id, "SetPackageState", findStateEnum(packageStates, current_systemState), findStateEnum(packageStates, next_state), globalUser.unique_id, {from: web3.eth.accounts[0], gas:4000000}, function(result){
  });
}

function newPackage_Contract(){
  package_op_string = "Pending Add Package";
  document.getElementById("package_op_info").value = package_op_string;
  var new_package = newPackage();
  if(new_package){
      packages.push(new_package);
      console.log(new_package, " ", new_package);
      contractInstance.addPackageAsset(new_package.unique_id, "CreateAsset", "Package", globalUser.unique_id, {from: web3.eth.accounts[0], gas:4000000}, function(result) {
      });
  }
  else{
      console.log("valid new_package not returned");
  }
}

var manifest = {
    unique_id: '',
    packages_list: [],
    orgination: '',
    destination: '',
};

function newManifest_Contract(){
    var new_manifest = {
        unique_id: uuid_hex(),
        packages_list: [],
        orgination: 'Facility 1',
        destination: 'Facilty 2',
    };
    packages.forEach(function(pkg){
        var id = 'include_'+pkg.unique_id;
        if(document.getElementById(id)){
            console.log(pkg.unique_id," include: ", document.getElementById(id).checked);
            if(document.getElementById(id).checked){
                new_manifest.packages_list.push(pkg);
            }
        }
    });
    console.log(new_manifest);
}

function changePackageState(id){
  //console.log(id);
  package_op_string = "Pending State Transition";
  document.getElementById("package_op_info").value = package_op_string;
  var select_id = 'selected_package_state_'+id;
  //console.log(select_id);
  var new_state = $('#'+select_id).val();
  console.log(new_state);
  var active_package = packages.find(function(package){
    return package.unique_id === id;
  });
  if(active_package){
    setPackageState(active_package, new_state);
    //active_package.state = new_state;
    //active_package.last_update_time = parseFloat(new Date().getTime() / 1000.0);
  }else{
    console.log("package not found for ", id);
  }
  //provenancePackagePage(active_package.unique_id);
}

function draw_package_stub(){
    package_provenance_page_is_active = false;
    $(package_provenance_page_div).html('');

    package_details_page_is_active = false;
    $(package_details_page_div).html('');

    //package_page_is_active = false;
    //$(package_page_div).html('');
    //$(package_controls_div).html('');
    packagePage();
}

var package_provenance_page_div;
var package_provenance_page_is_active = false;
function provenancePackagePage(package_id){
  package_page_is_active = false;
  $(package_page_div).html('');
  $(package_controls_div).html('');

  package_provenance_page_is_active = true;
  $(package_provenance_page_div).html('');

  var package = packages.find(function(package){
    return package.unique_id === package_id;
  });
  if(package){

  }else{
    console.log("no package for: ", package_id);
  }

  var html = '<button class="btn btn-danger"onclick="draw_package_stub()" >Go Back</button>';
  html += '<b>Package Provenance Table</b>';
  html += '<table class="table table-bordered table-striped" id="package_provenance_table">';
  html += '<tr><th colspan="2">No.</th><th colspan="2">ID</th><th colspan="2">Asset Type</th><th colspan="2">Creation</th><th colspan="2">Package Type</th><th>Currrent State</th><th>Last Update</th></tr>';  // Type, ID, creation, state, last update
  var count = 0;
  html += '<tr><td colspan="2">'+(++count)+'</td><td colspan="2">'+package.unique_id+'</td><td colspan="2">'+package.asset_type+'</td><td colspan="2">'+convertTimeLocal(package.creation_time)+'</td><td colspan="2">'+package.type+'</td><td>'+package.state;
  html += '</td><td>'+convertTimeLocal(package.last_update_time)+'</td>';
  html += '</tr>';

  if(package.transaction_list && package.transaction_list.length > 0){
      package.transaction_list.forEach(function(tx){
        //console.log("trans list ", tx.attempt, " ", tx.result);
        var attempt_items =  tx.attempt.split(",");
        var attempt_stg = '';
        attempt_items.forEach(function(item){
          attempt_stg += item + '<br/>';
        });
        var result_items =  tx.result.split(",");
        var result_stg = '';
        var result_index = 0;
        var txee_user = '';
        result_items.forEach(function(item){
          console.log(result_index,":",item);
          result_index++;
        });
        html += '<tr><td colspan ="12">'+'tx_hash: '+tx.tx_hash+'<br/>time: '+convertTimeLocal(tx.tx_time)+'<br/>Asset: '+ tx.asset_id;
        html += '<br/>' + '<button id="' + tx.tx_hash + '" class="btn btn" onclick="getTransByTxID(\'' + tx.tx_hash + '\')">Get Ledger Tx</button>'+'</td></tr>';
        if(result_items[0] === "CreateAsset"){
          txee_user = users.find(function(user){
            return user.unique_id === result_items[5];
          });
          //var role_name = findStateName(userRoles,parseInt(txee_user.role));
          html += '<tr><td colspan ="3" >' + 'Tx type<br/>' + result_items[0] +'<br/>'+result_items[1]+":"+result_items[2]+'</td><td colspan ="3">Product<br/>'+result_items[3]+ '</td><td colspan ="3">'+result_items[4]+'<br/>'+result_items[5]+'<br/>'+'role_name';
          html += '</td><td colspan="3" bgcolor="'+ findStateColor(transactionResultStates, result_items[7]) +'">Result<br/>'+result_items[7]+'</td></tr>';
        }else if(result_items[0] === "SetPackageState"){
          txee_user = users.find(function(user){
            return user.unique_id === result_items[8];
          });
          //var role_name = findStateName(userRoles,parseInt(txee_user.role));
          console.log(transactionResultStates);
          var color = findStateColor(transactionResultStates, result_items[10]);
          html += '<tr><td colspan ="4">' + 'Tx type:<br/>' + result_items[0] +'<br/>'+result_items[1]+":"+result_items[2]+'</td><td colspan ="2">From<br/>'+result_items[4]+'</td><td colspan ="2">To<br/>'+result_items[6]+'</td><td colspan ="2">'+result_items[7]+'<br/>'+result_items[8]+'<br/>'+'role_name'+'</td><td colspan="2" bgcolor="'+ findStateColor(transactionResultStates, result_items[10]) +'">Result<br/>'+result_items[10]+'</td></tr>';
        }
      });
    }
  html += '</table>';
  $(package_provenance_page_div).append(html);
}

var package_details_page_div;
var packge_details_page_active = false;
function detailsPackagePage(id){
    packge_details_page_active = true;
    $(package_details_page_div).html('');
    var package = packages.find(function(package){
        return package.unique_id === id;
    });
    var count = 0;
    html = '<br/><button class="btn btn-danger"onclick="draw_package_stub()" >Go Back</button>';
    html += '<b>Batch Package Details Table</b>';
    html += '<table class="table table-bordered table-striped" id="package_details_table">';
    html += '<tr><th>No.</th><th>ID</th><th>Asset Type</th><th>Creation</th><th>Package Type</th><th>Currrent State</th><th>Last Update</th></tr>';
    html += '<tr><td>'+(++count)+'</td><td>'+package.unique_id+'</td><td>'+package.asset_type+'</td><td>'+convertTimeLocal(package.creation_time)+'</td><td>'+package.type+'</td><td>'+package.state;
    html += '</td><td>'+convertTimeLocal(package.last_update_time)+'</td>';
    html += '</tr>';
    package.plant_packages_list.forEach(function(plant){
        html += '<tr><td>'+(++count)+'</td><td>'+plant.unique_id+'</td><td>'+plant.asset_type+'</td><td>'+convertTimeLocal(plant.creation_time)+'</td><td>'+plant.package_type+'</td><td>'+plant.state;
        html += '</td><td>'+convertTimeLocal(package.last_update_time)+'</td>';
        html += '</tr>';
    });
    html += '</table>';
    $(package_details_page_div).append(html);
}

var package_page_div;
var package_page_is_active = false;
var package_controls_div;
function packagePage(){
  asset_page_is_active = false;
  $(asset_div).html('');

  package_page_is_active = true;
  $(package_page_div).html('');

  html = '<div class="row-btns">';
  html += '<a href="#" onclick="newPackage_Contract()" class="btn btn-success">Add Package</a>';
  html += '<a href="#" onclick="getPackageStates()" class="btn btn-info">List Package States</a>';
  html += '</div>';
  $(package_controls_div).html(html);


  var html = '';
  // html += '<button class="btn btn-danger"onclick="draw_inventory_stub()" >Go Back</button>';
  html += '<div class="table-title">';
  html += '<b>Packages Table</b>';
  html += '<input id="package_op_info" type="text name="Operation">';
  html += '</div>';

  html += '<table class="table table-bordered table-striped" id="package_table">';
  html += '<tr><th>No.</th><th>ID</th><th>Asset Type</th><th>Creation</th><th>Package Type</th><th>Currrent State</th><th>Last Update</th><th>Details</th></tr>';  // Type, ID, creation, state, last update

  var count = 0;
  var pkg_plants = plants.filter(function(plant){
      return plant.state === "PACKAGED_TAGGED";
  });
  console.log(pkg_plants);
  pkg_plants.forEach(function(plant){
    html += '<tr><td>'+(++count)+'</td><td>'+plant.unique_id+'</td><td>'+plant.asset_type+'</td><td>'+convertTimeLocal(plant.creation_time)+'</td><td>'+plant.package_type+'</td><td>'+plant.state;
    html += '</select>';
    html += '</td><td>'+convertTimeLocal(plant.last_update_time)+'</td>';
    html += '<td><input type="checkbox" id="include_' + plant.unique_id + '"></td>';
    html += '</tr>';
    });
    html += '</table>';
  html += '<b>Batch Packages Table</b>';
  html += '<input id="package_op_info" type="text name="Operation">';
  html += '<table class="table table-bordered table-striped" id="package_table">';
  html += '<tr><th>No.</th><th>ID</th><th>Asset Type</th><th>Creation</th><th>Package Type</th><th>Currrent State</th><th>Last Update</th><th>Details</th><th>Select</th></tr>';

  var batch_packages = packages.filter(function(package){
     return package.asset_type === "BATCH_PACKAGE";
  });

  batch_packages.forEach(function(package){
    html += '<tr><td>'+(++count)+'</td><td>'+package.unique_id+'</td><td>'+package.asset_type+'</td><td>'+convertTimeLocal(package.creation_time)+'</td><td>'+package.type+'</td><td>'+package.state;

    var id = "selected_package_state_" + package.unique_id;
    console.log(id);
    html += '<br/><select id="'+ id + '" onchange="changePackageState(\'' + package.unique_id + '\')"'+'>';
    //html += '<br/><select id="selected_package_state" onchange="changePackageState(\'' + package.unique_id + '\')"'+'>';
    packageStates.forEach(function(packageState){
      if(package.state === packageState.state_name ){
        html += '<option selected value="'+ packageState.state_name + '">'+ packageState.state_name + '</option>';
      }else{
        html += '<option value="'+ packageState.state_name + '">'+ packageState.state_name + '</option>';
      }
    });
    html += '</select>';

    html += '</td><td>'+convertTimeLocal(package.last_update_time)+'</td>';
    html += '<td><button id="packageprovenance_' + package.unique_id + '" class="btn btn-primary" onclick="provenancePackagePage(\'' + package.unique_id + '\')"><span class="glyphicon glyphicon-tint"></span>&nbsp;Provenance</button></td>';
    html += '<td><button id="packagedetails_' + package.unique_id + '" class="btn btn-info" onclick="detailsPackagePage(\'' + package.unique_id + '\')"><span class="glyphicon glyphicon-check"></span>&nbsp;Details</button></td>';
    html += '</tr>';
  });
  html += '</table>';
  $(package_page_div).append(html);

// TODO: REVIEW
// document.getElementById("package_op_info").value = package_op_string;
  html = '';
  html += '<a href="#" onclick="newPackage_Contract()" class="btn btn-success">Add Package</a>';
  //html += '<a href="#" onclick="newManifest_Contract()" class="btn btn-success">Add Manifest</a>';
  html += '<a href="#" onclick="getPackageStates()" class="btn btn-info">List Package States</a>';
  $(package_controls_div).append(html);
  if(document.getElementById("package_op_info")){
      document.getElementById("package_op_info").value = package_op_string;
  }
}

$(document).ready(function() {
    package_page_div = app_container_top.appendChild(document.createElement('div'));
    package_page_div.classList.add('table-responsive');

    package_controls_div = app_container_top.appendChild(document.createElement('div'));

    package_provenance_page_div = app_container_top.appendChild(document.createElement('div'));
    package_provenance_page_div.classList.add('table-responsive');

    package_details_page_div = app_container_top.appendChild(document.createElement('div'));
    package_details_page_div.classList.add('table-responsive');

    var make_packages = false;
    if(make_packages){
      var local_packages = [];
      for(var i = 0; i < 5; i++){
        var new_package = newPackage();
        console.log(new_package);
        local_packages.push(new_package);
      }
      console.log(local_packages);
      global_packages = local_packages;
    }
});
