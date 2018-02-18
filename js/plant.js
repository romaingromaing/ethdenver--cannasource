var enumPlantStates = {
  CREATED_PLANT: 0,
  IMMATURE: 1,
  VEGETATIVE_TAGGED: 2,
  FLOWERING: 3,
  CUT_GET_WET_WEIGHT: 4,
  HARVESTED: 5,
  PACKAGED_TAGGED: 6,
  ADDED_TO_BATCH: 7,
  DISPOSED: 8,
};

var plantStates = [
    {
      state_name: 'CREATED_PLANT',
      state_enum:  enumPlantStates.CREATED_PLANT
    },{
      state_name: 'IMMATURE',
      state_enum:  enumPlantStates.IMMATURE
    },{
      state_name: 'VEGETATIVE_TAGGED',
      state_enum:  enumPlantStates.VEGETATIVE_TAGGED
    },{
      state_name: 'FLOWERING',
      state_enum:  enumPlantStates.FLOWERING
    },{
      state_name: 'CUT_GET_WET_WEIGHT',
      state_enum:  enumPlantStates.CUT_GET_WET_WEIGHT
    },{
      state_name: 'HARVESTED',
      state_enum:  enumPlantStates.HARVESTED
    },{
      state_name: 'PACKAGED_TAGGED',
      state_enum:  enumPlantStates.PACKAGED_TAGGED
    },{
      state_name: 'ADDED_TO_BATCH',
      state_enum:  enumPlantStates.ADDED_TO_BATCH
    },{
      state_name: 'DISPOSED',
      state_enum:  enumPlantStates.DISPOSED
    }
];

var state_rec = {
  state_name: '',
  start_time: '',
  end_time: '',
};

var welfare_rec = {
    height: '',
    notes: ''
};

var assetPlant = {
  unique_id: '',
  asset_type: '',
  strain: '',
  location: '',
  state: '',
  creation_time: '',
  last_update_time: '',
  transaction_list: [],
  veg_tag_id: '',
  imm_batch_id: '',
  harvest_yield: '',
  package_yield: '',
  package_tag_id: '',
  package_type: '',
  state_recs: [],
  welfare_recs: [],
};

var plants = [];

//var queued_plant_state_list = [];

var plant_op_string = "No Pending Op";

function newPlant(){
  state_rec = {
    state_name: 'CREATED_PLANT',
    start_time: parseFloat(new Date().getTime() / 1000.0),
    end_time: 0,
  };
  var welfare_rec = {
      height: 2,
      notes: 'Healthy',
      last_update_time: parseFloat(new Date().getTime() / 1000.0),
  };

  var new_assetPlant = {
    unique_id: uuid_hex(),
    asset_type: "PLANT",
    strain: "Strain 1",
    location: "Plant Room",
    state: "CREATED_PLANT",
    creation_time: parseFloat(new Date().getTime() / 1000.0),
    last_update_time: parseFloat(new Date().getTime() / 1000.0),
    transaction_list: [],
    veg_tag_id: '',
    imm_batch_id: '',
    harvest_yield: '0',
    package_yield: '0',
    package_tag_id: '',
    package_type: '',
    state_recs: [],
    welfare_recs: [],
};
  attempt_stg = "CreateAsset,Plant,ID," + new_assetPlant.unique_id + ",TXEE," + globalUser.unique_id;
  transaction_summary = {
    tx_hash: '',
    tx_time: '',
    asset_id: new_assetPlant.unique_id,
    attempt: attempt_stg,
    result: 'Incomplete',
    tx_class: 'PLANT',
    tx_ee: globalUser.unique_id,
  };
  new_assetPlant.transaction_list.push(transaction_summary);
  new_assetPlant.state_recs.push(state_rec);
  new_assetPlant.welfare_recs.push(welfare_rec);

  return (new_assetPlant);
}

var addEvent = contractInstance.AddPlantAssetEvent();
addEvent.watch(function(error,result){
  if(!error){
    console.log("AddPlantAssetEvent ", result, " tx_hash: ", result.transactionHash);
    console.log("AddPlantAssetEvent args ",result.args.assetInfo);
    var result_elems = result.args.assetInfo.split(",");
    var elem_index = 0;
    result_elems.forEach(function(elem){
     console.log(elem_index,":",elem);
     elem_index++;
    });
    var active_asset = plants.find(function(plant){
      return plant.unique_id === result_elems[3];
    });
    if(active_asset){
      if(active_asset.transaction_list){
          var currentTrans = active_asset.transaction_list.find(function(trans){
            return trans.attempt.startsWith("CreateAsset,Plant") && trans.result === "Incomplete";
          });
          //console.log(currentTrans);
          currentTrans.tx_hash = result.transactionHash;
          currentTrans.tx_time = parseFloat(new Date().getTime() / 1000.0);
          currentTrans.result = result.args.assetInfo;
          console.log(active_asset);
          plant_op_string = "Add Plant Completed";
          if(document.getElementById("plant_op_info")){
            document.getElementById("plant_op_info").value = plant_op_string;
          }
          plantPage();
      }else{
          console.log("No active_asset.transaction_list");
      }
    }else{
      console.log("asset not found for: ", result_elems[3]);
    }
  }else{
      console.log(error);
  }
});

var plant_state_btn = false; // hack to prevent old event from doing alert on reset
var addEvent = contractInstance.GetPlantStatesEvent();
addEvent.watch(function(error,result){
  if(!error){
    console.log("GetPlantStatesEvent ", result, " tx_hash: ", result.transactionHash);
    console.log("GetPlantStatesEvent args ",result.args.assetInfo);
    var result_elems = result.args.assetInfo.split(",");
    var elem_index = 0;
    var plant_state_list = '';
    result_elems.forEach(function(elem){
     console.log(elem_index,":",elem);
     elem_index++;
     plant_state_list += elem+"\n";
    });
    if(plant_state_btn){
      alert(plant_state_list);
      plant_op_string = "Completed State List Request";
      if(document.getElementById("plant_op_info")){
        document.getElementById("plant_op_info").value = plant_op_string;
      }
      plant_state_btn = false;
    }
  }else{
      console.log(error);
  }
});

function getPlantStates() {
  plant_state_btn = true;
  plant_op_string = "Pending State List Request";
  document.getElementById("plant_op_info").value = plant_op_string;
  contractInstance.GetPlantStates("GetPlantStates", globalUser.unique_id, {from: web3.eth.accounts[0], gas:4000000}, function(result) {
  });
}

var addEvent = contractInstance.SetPlantStateEvent();
addEvent.watch(function(error,result){
    if(!error){
        //console.log("SetPlantStateEvent ", result);
        var result_elems = result.args.assetInfo.split(",");
        if(result_elems.length === 0){
          return;
        }
        //var count = 0;
        //result_elems.forEach(function(item){
        //    console.log(count," ", item);
        //    count++;
        //});

        var id = result_elems[2];
        var process_category = result_elems[1];
        var previous_state = result_elems[4];
        var new_state_name =  result_elems[6];
        var active_asset = plants.find(function(asset){
          return asset.unique_id === id;
        });
        if(active_asset){
          //console.log("active_asset: ",active_asset);
        }else{
          console.log("asset not found for: ", result_elems[0]);
        }
        //console.log(process_category, " from :", previous_state, " to: ",new_state_name);
        if(active_asset && active_asset.transaction_list){
          var current_state_rec = active_asset.state_recs.find(function(state_rec){
            return state_rec.state_name === active_asset.state && state_rec.end_time === 0;
          });
          current_state_rec.end_time = parseFloat(new Date().getTime() / 1000.0);

            active_asset.state = new_state_name;
            active_asset.last_update_time = parseFloat(new Date().getTime() / 1000.0);

            state_rec = {
              state_name: new_state_name,
              start_time: parseFloat(new Date().getTime() / 1000.0),
              end_time: 0,
            };
            active_asset.state_recs.push(state_rec);

            var currentTrans = active_asset.transaction_list.find(function(trans){
              return trans.attempt.startsWith("SetPlantState") && trans.result === "Incomplete";
            });
            if(currentTrans){
              currentTrans.tx_hash = result.transactionHash;
              currentTrans.tx_time = parseFloat(new Date().getTime() / 1000.0);
              currentTrans.result = result.args.assetInfo;
              console.log(currentTrans, " process_category: ", process_category);
            }else{
                console.log("transaction not found for: ", process_category);
            }
            console.log(active_asset);
            plant_op_string = "State Transition Complete";
            if(document.getElementById("plant_op_info")){
              document.getElementById("plant_op_info").value = plant_op_string;
            }

            //provenancePlantPage(active_asset.unique_id);
            plantPage();
        }else{
            console.log("No active_asset");
        }
    }else{
        console.log(error);
    }
});

function setPlantState(active_plant, next_state) {
  current_systemState = active_plant.state;
  var attempt_stg = "SetPlantState,ID,"+active_plant.unique_id+',current,'+current_systemState+",next,"+next_state+",TXEE: " + globalUser.unique_id;
  console.log(attempt_stg);
  transaction_summary = {
    tx_hash: '',
    asset_id: active_plant.unique_id,
    attempt: attempt_stg,
    result: 'Incomplete',
    tx_class: 'PLANT',
    tx_ee: globalUser.unique_id
  };
  active_plant.transaction_list.push(transaction_summary);
  console.log(current_systemState, " ", next_state);
  console.log("SetPlantState", findStateEnum(plantStates, current_systemState), findStateEnum(plantStates, next_state), globalUser.unique_id);
  contractInstance.setPlantState(active_plant.unique_id, "SetPlantState", findStateEnum(plantStates, current_systemState), findStateEnum(plantStates, next_state), globalUser.unique_id, {from: web3.eth.accounts[0], gas:4000000}, function(result){
  });
}

var addEvent = contractInstance.TestSetPlantStateEvent();
addEvent.watch(function(error,result){
    if(!error){
        //console.log("SetPlantStateEvent ", result);
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
        var process_category = result_elems[0];
        var previous_state = result_elems[4];
        var new_state_name =  result_elems[6];
        var active_asset = plants.find(function(asset){
          return asset.unique_id === id;
        });
        if(active_asset){
          //console.log("active_asset: ",active_asset);
        }else{
          console.log("asset not found for: ", result_elems[2]);
        }
        //console.log(process_category, " from :", previous_state, " to: ",new_state_name);
        if(active_asset && active_asset.transaction_list){
          var current_state_rec = active_asset.state_recs.find(function(state_rec){
            return state_rec.state_name === active_asset.state && state_rec.end_time === 0;
          });
          current_state_rec.end_time = parseFloat(new Date().getTime() / 1000.0);

          if(result_elems[10] === "ALLOWED"){
            if(new_state_name === "VEGETATIVE_TAGGED"){
              var alert_msg = "The Plant must be at least 8 in tall\n or container greater than 2 in \n AND you must assign a unique RFID tag" ;
              window.confirm(alert_msg);
              var state_result = false;
              if(window.confirm){
                active_asset.state = new_state_name;
                active_asset.veg_tag_id = uuid_hex();
                state_result = true;
                state_rec = {
                  state_name: new_state_name,
                  start_time: parseFloat(new Date().getTime() / 1000.0),
                  end_time: 0,
                };
              }else{
                state_result = false;
              }
            }else if(new_state_name === "IMMATURE"){
              var alert_msg = "You must assign an immature batch ID" ;
              window.confirm(alert_msg);
              var state_result = false;
              if(window.confirm){
                active_asset.state = new_state_name;
                active_asset.imm_batch_id = uuid_hex();
                state_result = true;
                state_rec = {
                  state_name: new_state_name,
                  start_time: parseFloat(new Date().getTime() / 1000.0),
                  end_time: 0,
                };
              }else{
                state_result = false;
              }
            }else if(new_state_name === "CUT_GET_WET_WEIGHT"){
              var wet_weight = prompt("Enter Wet Yield (oz)");
              active_asset.harvest_yield = wet_weight;
              active_asset.state = new_state_name;
              var state_result = true;
              state_rec = {
                state_name: new_state_name,
                start_time: parseFloat(new Date().getTime() / 1000.0),
                end_time: 0,
              };
            }else if(new_state_name === "HARVESTED"){
              var dry_weight = prompt("Enter Dry Yield (oz)");
              active_asset.package_yield = dry_weight;
              active_asset.state = new_state_name;
              var state_result = true;
              state_rec = {
                state_name: new_state_name,
                start_time: parseFloat(new Date().getTime() / 1000.0),
                end_time: 0,
              };
            }else if(new_state_name === "PACKAGED_TAGGED"){
                var alert_msg = "You may package buds or shake of the same strain \n AND you must assign a unique RFID tag" ;
                window.confirm(alert_msg);
                var state_result = false;
                if(window.confirm){
                  active_asset.state = new_state_name;
                  active_asset.package_tag_id = uuid_hex();
                  active_asset.package_type = 'Buds';
                  state_result = true;
                  state_rec = {
                    state_name: new_state_name,
                    start_time: parseFloat(new Date().getTime() / 1000.0),
                    end_time: 0,
                  };
                }else{
                  state_result = false;
                }
            }else{  // allow these trans without user confirmation
              active_asset.state = new_state_name;
              var state_result = true;
              state_rec = {
                state_name: new_state_name,
                start_time: parseFloat(new Date().getTime() / 1000.0),
                end_time: 0,
              };
            }
          }else{
              alert("Forbidden State Transition, Prevented");
            state_rec = {
              state_name: active_asset.state,
              start_time: parseFloat(new Date().getTime() / 1000.0),
              end_time: 0,
            };
          }
          active_asset.last_update_time = parseFloat(new Date().getTime() / 1000.0);
          active_asset.state_recs.push(state_rec);

            var currentTrans = active_asset.transaction_list.find(function(trans){
              return trans.attempt.startsWith("TestSetPlantState") && trans.result === "Incomplete";
            });
            if(currentTrans){
              currentTrans.tx_hash = result.transactionHash;
              currentTrans.tx_time = parseFloat(new Date().getTime() / 1000.0);
              currentTrans.result = result.args.assetInfo;
              console.log(currentTrans, " process_category: ", process_category);
            }else{
                console.log("transaction not found for: ", process_category);
            }
            console.log(active_asset);
            plant_op_string = "State Transition Complete";
            if(document.getElementById("plant_op_info")){
              document.getElementById("plant_op_info").value = plant_op_string;
            }

            //provenancePlantPage(active_asset.unique_id);
            plantPage();
        }else{
            console.log("No active_asset");
        }
    }else{
        console.log(error);
    }
});

function testSetPlantState(active_plant, next_state) {
  current_systemState = active_plant.state;
  var attempt_stg = "TestSetPlantState,ID,"+active_plant.unique_id+',current,'+current_systemState+",next,"+next_state+",TXEE: " + globalUser.unique_id;
  console.log(attempt_stg);
  transaction_summary = {
    tx_hash: '',
    asset_id: active_plant.unique_id,
    attempt: attempt_stg,
    result: 'Incomplete',
    tx_class: 'PLANT',
    tx_ee: globalUser.unique_id
  };
  active_plant.transaction_list.push(transaction_summary);
  console.log(current_systemState, " ", next_state);
  console.log("TestSetPlantState", findStateEnum(plantStates, current_systemState), findStateEnum(plantStates, next_state), globalUser.unique_id);
  contractInstance.testSetPlantState(active_plant.unique_id, "TestSetPlantState", findStateEnum(plantStates, current_systemState), findStateEnum(plantStates, next_state), globalUser.unique_id, {from: web3.eth.accounts[0], gas:4000000}, function(result){
  });
}

function newPlant_Contract(id, mode){
  document.getElementById("plant_op_info").value = "Pending Add Plant";
  var active_plant = plants.find(function(plant){
    return plant.unique_id === id;
  });
  if(active_plant){
    if(mode === 'new'){
      contractInstance.addPlantAsset(active_plant.unique_id, "CreateAsset", "Plant", globalUser.unique_id, {from: web3.eth.accounts[0], gas:4000000}, function(result) {
      });
    }else if(mode === 'update'){
      console.log("plant update not implemented");
      plant_details_page_is_active = false;
      $(plant_details_page_div).html('');
      plantPage();
    }
  }else{
    console.log("active_plant not found for: ", id);
  }
}

var force_state_test = true;
function changePlantState(id){
  document.getElementById("plant_op_info").value = "Pending State Transition";
  console.log(id);
  var select_id = 'selected_plant_state_'+id;
  console.log(select_id);
  var new_state = $('#'+select_id).val();
  console.log(new_state);
  var active_plant = plants.find(function(plant){
    return plant.unique_id === id;
  });
  if(active_plant){
    if(force_state_test){
      testSetPlantState(active_plant, new_state);
    }else{
      setPlantState(active_plant, new_state);
    }
    //active_plant.state = new_state;
    //active_plant.last_update_time = parseFloat(new Date().getTime() / 1000.0);
  }else{
    console.log("plant not found for ", id);
  }
}

function draw_plant_stub(){
  console.log("plant stub");
    plant_provenance_page_is_active = false;
    $(plant_provenance_page_div).html('');

    //plant_page_is_active = false;
    //$(plant_page_div).html('');
    //$(plant_controls_div).html('');
    plantPage();
}

var plant_provenance_page_div;
var plant_provenance_page_is_active = false;
function provenancePlantPage(plant_id){
  plant_page_is_active = false;
  $(plant_page_div).html('');
  $(plant_controls_div).html('');

  plant_provenance_page_is_active = true;
  $(plant_provenance_page_div).html('');

  var plant = plants.find(function(plant){
    return plant.unique_id === plant_id;
  });

  var html = '<button class="btn btn-danger"onclick="draw_plant_stub()" >Go Back</button>';
  html += '<b>Plant Provenance Table</b>';
  html += '<table class="table table-bordered table-striped" id="plant_provenance_table">';
  html += '<tr><th colspan ="2">No.</th><th colspan ="2">ID</th><th colspan ="2">Asset Type</th><th colspan ="2">Creation</th><th colspan ="2">Currrent State</th><th colspan ="2">Last Update</th></tr>';  // Type, ID, creation, state, last update
  var count = 0;
    html += '<tr><td colspan ="2">'+(++count)+'</td><td colspan ="2">'+plant.unique_id+'</td><td colspan ="2">'+plant.asset_type+'</td><td colspan ="2">'+convertTimeLocal(plant.creation_time)+'</td><td colspan ="2">'+plant.state;
    html += '</td><td colspan ="2">'+convertTimeLocal(plant.last_update_time)+'</td>';
    html += '</tr>';
    if(plant.transaction_list && plant.transaction_list.length > 0){
        plant.transaction_list.forEach(function(tx){
          console.log("tx: ", tx);
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
            html += '</td><td colspan="3" bgcolor="'+ findStateColor(transactionResultStates, result_items[7]) +'">Result<br/>'+result_items[10]+'</td></tr>';
          }else if(result_items[0] === "SetPlantState" || result_items[0] === "TestSetPlantState"){
            txee_user = users.find(function(user){
              return user.unique_id === result_items[8];
            });
            //var role_name = findStateName(userRoles,parseInt(txee_user.role));
            console.log(result_items[10]);
            var color = findStateColor(transactionResultStates, result_items[10]);
            html += '<tr><td colspan ="4">' + 'Tx type:<br/>' + result_items[0] +'<br/>'+result_items[1]+":"+result_items[2]+'</td><td colspan ="2">From<br/>'+result_items[4]+'</td><td colspan ="2">To<br/>'+result_items[6]+'</td><td colspan ="2">'+result_items[7]+'<br/>'+result_items[8]+'<br/>'+'role_name'+'</td><td colspan="2" bgcolor="'+ findStateColor(transactionResultStates, result_items[10]) +'">Result<br/>'+result_items[10]+'</td></tr>';
          }
        });
      }
  //});
  html += '</table>';
  $(plant_provenance_page_div).append(html);
}

function changePlantState_2(id){
  document.getElementById("plant_op_info").value = "Pending State Transition";
  console.log(id);
  var select_id = 'selected_plant_state_2_'+id;
  console.log(select_id);
  var new_state = $('#'+select_id).val();
  console.log(new_state);
  var active_plant = plants.find(function(plant){
    return plant.unique_id === id;
  });
  if(active_plant){
    if(force_state_test){
      testSetPlantState(active_plant, new_state);
    }else{
      setPlantState(active_plant, new_state);
    }
    //active_plant.state = new_state;
    //active_plant.last_update_time = parseFloat(new Date().getTime() / 1000.0);
  }else{
    console.log("plant not found for ", id);
  }
}

var plant_details_page_is_active = false;
var plant_details_page_div;
function plantDetails(id, mode){
    console.log(id, " ",mode);
    var active_plant;
    if(mode === 'new'){
      var new_plant = newPlant();
      plants.push(new_plant);
      active_plant = new_plant;
    }else if(mode === 'update'){
      active_plant = plants.find(function(plant){
        return plant.unique_id === id;
      });
      if(active_plant){
      }else{
        console.log("no active plant for: ", id);
      }
    }
    plant_details_page_is_active = true;
    $(plant_details_page_div).html('');
    var plant_btn_title = 'Close';
    if(mode === 'new'){
      plant_btn_title = 'New Plant';
    }

    var html = '<br/><br/>';
    html += '<b>Plant Details Table</b>';
    html += '<table class="table table-bordered table-striped" id="plant_details_table">';
    html += '<tr><th>IDs</th><th>Asset Type</th><th>Creation</th><th>Currrent State</th><th>Last Update</th><th>Strain<th>Location</th><th>Wet Yield</th><th>Dry Yield</th></tr>';
    html += '<tr><td>'+active_plant.unique_id+'<br/><b>Batch:</b>'+active_plant.imm_batch_id+'<br/>Veg:'+active_plant.veg_tag_id+'<br/>Pkg:'+active_plant.package_tag_id+'</td><td>'+active_plant.asset_type+'</td><td>'+convertTimeLocal(active_plant.creation_time)+'</td><td>'+active_plant.state;
    var id = "selected_plant_state_2_" + active_plant.unique_id
    //console.log(id);

    html += '<br/><select id="'+ id + '" onchange="changePlantState_2(\'' + active_plant.unique_id + '\')"'+'>';
    plantStates.forEach(function(plantState){
        if(plantState.state_name === "ADDED_TO_BATCH"){
            html += '<option value="'+ plantState.state_name + '" disabled>'+ plantState.state_name + '</option>';
        }else if(active_plant.state === plantState.state_name ){
            html += '<option selected value="'+ plantState.state_name + '">'+ plantState.state_name + '</option>';
        }else{
            html += '<option value="'+ plantState.state_name + '">'+ plantState.state_name + '</option>';
        }
    });
    html += '</select>';
    html += '</td><td>'+convertTimeLocal(active_plant.last_update_time)+'</td>';
    html += '<td>'+active_plant.strain+'</td><td>'+active_plant.location+'</td>';
    html += '</td><td>'+active_plant.harvest_yield+'</td><td>'+active_plant.package_yield+'</td>';
    html += '</tr>';

    html += '<tr><th>State Records</th><th>Start</th><th>End</th><th>Duration (s)</th></tr>';
    if(active_plant.state_recs && active_plant.state_recs.length > 0){
      active_plant.state_recs.forEach(function(state_rec){
        var end_time = 'In State';
        var duration = 'NA';
        if(state_rec.end_time > 0){
          end_time = convertTimeLocal(state_rec.end_time);
          duration = (state_rec.end_time - state_rec.start_time).toFixed(0);
        }
        html += '<tr><td>'+state_rec.state_name+'</td><td>'+convertTimeLocal(state_rec.start_time)+'</td><td>'+ end_time +'</td><td>'+ duration +'</td></tr>';
      });
    }

    html += '<tr><th>Welfare Records</th><th>Height</th><th>Notes</th><th>Time</th><th>Since Last (s)</th></tr>';
    var count = 0;
    if(active_plant.welfare_recs && active_plant.welfare_recs.length > 0){
      var last_time = 0;
      active_plant.welfare_recs.forEach(function(welfare_rec){
        html += '<tr><td>'+(count++)+'</td><td>'+welfare_rec.height+'</td><td>'+welfare_rec.notes+'</td><td>'+ convertTimeLocal(welfare_rec.last_update_time) +'</td>';
        if(last_time !== 0){
          html += '<td>'+ (welfare_rec.last_update_time - last_time).toFixed(0) +'</td></tr>';
        }else{
          html += '<td>'+ '0' +'</td></tr>';
        }

        last_time = welfare_rec.last_update_time;
      });
    }

    html += '</table>';

    html += '<a href="#" onclick="newPlant_Contract(\'' + active_plant.unique_id + '\', \''+mode+'\')" class="btn btn-success">'+plant_btn_title+'</a>';

    $(plant_details_page_div).append(html);
}

function updatePlantWelfare(id){
    var active_plant = plants.find(function(plant){
      return plant.unique_id === id;
    });
    var height = document.getElementById("welfare_height").value;
    var notes = document.getElementById("welfare_notes").value;
    welfare_rec = {
      height: height,
      notes: notes,
      last_update_time: parseFloat(new Date().getTime() / 1000.0),
    };
    active_plant.welfare_recs.push(welfare_rec);
    //console.log(active_plant);

    plant_welfare_page_is_active = false;
    $(plant_welfare_page_div).html('');
    plantPage();
}

var plant_welfare_page_is_active = false;
var plant_welfare_page_div;
function newWelfareRec(id){
  var active_plant = plants.find(function(plant){
    return plant.unique_id === id;
  });

  welfare_rec = {
    height: 'Enter Height',
    notes: 'Enter Notes',
    last_update_time: parseFloat(new Date().getTime() / 1000.0),
  };
  plant_welfare_page_is_active = true;
  $(plant_welfare_page_div).html('');

  var html = '<br/><br/>';
  html += '<a href="#" onclick="updatePlantWelfare(\'' + active_plant.unique_id + '\')" class="btn btn-success">'+'Add Welfare Rec'+'</a>';
  html += '<b>Plant Welfare Table</b>';
  html += '<table class="table table-bordered table-striped" id="plant_details_table">';
  html += '<tr><th>ID</th><th>Height</th><th>Notes</th><th>Time</th></tr>';
  //html += '<input id="plant_op_info" type="text" name="Operation">';
  html += '<tr><td>'+active_plant.unique_id+'</td><td> <input id="welfare_height" type="text">'+welfare_rec.height+'</td><td> <input id="welfare_notes" type="text">'+welfare_rec.notes+'</td><td>'+convertTimeLocal(welfare_rec.last_update_time)+'</td></tr>';
  html += '</table>';
  $(plant_welfare_page_div).append(html);
}
var plant_page_div;
var plant_page_is_active = false;
var plant_controls_div;

function plantPage(){
  asset_page_is_active = false;
  $(asset_div).html('');

  plant_provenance_page_is_active = false;
  $(plant_provenance_page_div).html('');

  plant_details_page_is_active = false;
  $(plant_details_page_div).html('');

  plant_welfare_page_is_active = false;
  $(plant_welfare_page_div).html('');

  plant_page_is_active = true;
  $(plant_page_div).html('');

  $(plant_controls_div).html('');

  var html = '<div class="row-btns">';
  html += '<a href="#" onclick="plantDetails(\'' + '' + '\', \''+'new'+'\')" class="btn btn-success">Add Plant</a>';
  html += '<a href="#" onclick="plantRoomPage()" class="btn btn-primary">Plant Room</a>';
  html += '<a href="#" onclick="getPlantStates()" class="btn btn-info">List Plant States</a>';
  html += '</div>';
  $(plant_controls_div).append(html);

  html = '<div class="">';
  // html += '<button class="btn btn-danger"onclick="draw_inventory_stub()" >Go Back</button>';
  html += '<b>Plants Table</b>';
  html += '<input id="plant_op_info" disabled type="text" name="Operation">';

  html += '<table class="table table-bordered table-striped" id="plant_table">';
  html += '<tr><th>No.</th><th>ID</th><th>Asset Type</th><th>Creation</th><th>Currrent State</th><th>Last Update</th><th>Actions</th></tr>';  // Type, ID, creation, state, last update

  var count = 0;
  plants.forEach(function(plant){
    html += '<tr><td>'+(++count)+'</td><td>'+plant.unique_id+'</td><td>'+plant.asset_type+'</td><td>'+convertTimeLocal(plant.creation_time)+'</td><td>'+plant.state;
    var id = "selected_plant_state_" + plant.unique_id;
    //console.log(id);
    html += '<br/><select id="'+ id + '" onchange="changePlantState(\'' + plant.unique_id + '\')"'+'>';
    plantStates.forEach(function(plantState){
        if(plantState.state_name === "ADDED_TO_BATCH"){
            html += '<option value="'+ plantState.state_name + '" disabled>'+ plantState.state_name + '</option>';
        }else if(plant.state === plantState.state_name ){
            html += '<option selected value="'+ plantState.state_name + '">'+ plantState.state_name + '</option>';
        }else{
            html += '<option value="'+ plantState.state_name + '">'+ plantState.state_name + '</option>';
        }
    });
    html += '</select>';
    html += '</td><td>'+convertTimeLocal(plant.last_update_time)+'</td>';
    html += '<td><button id="plantprov_' + plant.unique_id + '" class="btn btn-primary" onclick="provenancePlantPage(\'' + plant.unique_id + '\')"><span class="glyphicon glyphicon-tint"></span>&nbsp;Provenance</button>';
    html += '<button id="plantdetails_' + plant.unique_id + '" class="btn btn-info" onclick="plantDetails(\'' + plant.unique_id + '\', \''+'update'+'\')"><span class="glyphicon glyphicon-check"></span>&nbsp;Details</button>';
    html += '<button id="plantwelfare_' + plant.unique_id + '" class="btn btn-success" onclick="newWelfareRec(\'' + plant.unique_id + '\')"><span class="glyphicon glyphicon-plus"></span>&nbsp;Add Welfare Rec</button></td>';
    html += '</tr>';
  });
  html += '</table>';
  $(plant_page_div).append(html);

  document.getElementById("plant_op_info").value = plant_op_string;

}

$(document).ready(function() {
  plant_page_div = app_container_top.appendChild(document.createElement('div'));
  plant_page_div.classList.add('table-responsive');

  plant_controls_div = app_container_top.appendChild(document.createElement('div'));

  plant_provenance_page_div = app_container_top.appendChild(document.createElement('div'));
  plant_provenance_page_div.classList.add('table-responsive');

  plant_details_page_div = app_container_top.appendChild(document.createElement('div'));
  plant_details_page_div.classList.add('table-responsive');

  plant_welfare_page_div = app_container_top.appendChild(document.createElement('div'));
  plant_welfare_page_div.classList.add('table-responsive');

  var make_plants = false;
  if(make_plants){
    var local_plants = [];
    for(var i = 0; i < 5; i++){
      var new_plant = newPlant();
      console.log(new_plant);
      local_plants.push(new_plant);
    }
    console.log(local_plants);
    global_plants = local_plants;
  }
});
