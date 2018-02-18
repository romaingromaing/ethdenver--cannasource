var enumUserRoles = {
  ANONYMOUS: 0,
  EMPLOYEE: 1,
  REGULATOR: 2,
}

var userRoles = [
    {
      state_name: 'ANONYMOUS',
      state_enum:  enumUserRoles.ANONYMOUS
    },{
      state_name: 'EMPLOYEE',
      state_enum:  enumUserRoles.EMPLOYEE
    },{
      state_name: 'REGULATOR',
      state_enum:  enumUserRoles.REGULATOR
    }
];

// group_type
// admin 
var user = {
  unique_id: '',
  role: '',
  facility: '',
  transaction_list: [],
};

var users = [];

var user_op_string = "No Pending Op";

var addEvent = contractInstance.UpdateUserEvent();
addEvent.watch(function(error,result){
  if(!error){
    console.log("UpdateUserEvent ", result, " tx_hash: ", result.transactionHash);
    console.log("UpdateUserEvent args ",result.args.userInfo);
    var result_elems = result.args.userInfo.split(",");
    var elem_index = 0;
    result_elems.forEach(function(elem){
     console.log(elem_index,":",elem);
     elem_index++;
    });
    var active_user = users.find(function(user){
      return user.unique_id === result_elems[3];
    });
    if(active_user){
      if(active_user.transaction_list){
          var currentTrans = active_user.transaction_list.find(function(trans){
            return trans.attempt.includes("User") && trans.result === "Incomplete";
          });
          //console.log(currentTrans);
          currentTrans.tx_hash = result.transactionHash;
          currentTrans.tx_time = parseFloat(new Date().getTime() / 1000.0);
          currentTrans.result = result.args.userInfo;
          console.log(active_user);
          user_op_string = "Update User Completed";
          document.getElementById("user_op_info").value = user_op_string;
          userPage();
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

function user_Contract(id, mode){
  user_op_string = "Pending User Update";
  document.getElementById("user_op_info").value = user_op_string;

  console.log(id, " ",mode);
  var contract_op = '';
  var active_user = users.find(function(user){
    return user.unique_id === id;
  });

  var role_id = 'user_role_' + active_user.unique_id ;
  console.log("role_id:",role_id);
  var role = document.getElementById(role_id).value;
  console.log(role_id, " ", role);
  active_user.role = findStateEnum(userRoles,role);

  var fac_id = 'user_facility_' + active_user.unique_id ;
  var fac = document.getElementById(fac_id).value;
  console.log(fac_id, " ", fac);
  active_user.facility = fac;

  if(active_user){
    if(mode === 'new'){
      attempt_stg = "Create,User,ID," + active_user.unique_id + ",TXEE," + globalUser.unique_id;
      contract_op = "Create,User";
    }else if(mode === 'update'){
        attempt_stg = "Update,User,ID," + active_user.unique_id + ",TXEE," + globalUser.unique_id;
        contract_op = "Update,User";
    }
    transaction_summary = {
      tx_hash: '',
      tx_time: '',
      asset_id: active_user.unique_id,
      attempt: attempt_stg,
      result: 'Incomplete',
      tx_class: 'USER',
      tx_ee: globalUser.unique_id,
    };
    active_user.transaction_list.push(transaction_summary);
    contractInstance.updateUser(active_user.unique_id, contract_op, "User", globalUser.unique_id, {from: web3.eth.accounts[0], gas:4000000}, function(result) {
    });
  }else{
    console.log("active_user not found for: ", id);
  }
}

var user_details_page_is_active = false;
var user_details_page_div;
function userDetails(id, mode){
  console.log(id, " ",mode);
  var active_user;

  if(mode === 'new'){
    var new_user = {
      unique_id: uuid_hex(),
      role: 0,
      facility: 'NONE',
      transaction_list: [],
    };
    users.push(new_user);
    active_user = new_user;
  }else if(mode === 'update'){
    active_user = users.find(function(user){
      return user.unique_id === id;
    });
  }

  user_details_page_is_active = true;
  $(user_details_page_div).html('');
  var user_btn_title = 'Update User';
  if(mode === 'new'){
    user_btn_title = 'New User';
  }
  var html = '';
  html += '<a href="#" onclick="user_Contract(\'' + active_user.unique_id + '\', \''+mode+'\')" class="btn btn-success">'+user_btn_title+'</a>';
  html += '<b>User Details Table</b>';
  html += '<table class="table table-bordered table-striped" id="user_details_table">';
  html += '<tr><th>ID</th><th>Role</th><th>Facility</th></tr>';
  html += '<tr><td>'+active_user.unique_id+'</td>';
  //html +='<td>'+findStateName(userRoles,active_user.role)+'</td>';
  // +findStateName(userRoles,active_user.role)
  html +='</td><td colspan="1">'+ 'Role: <br/><select id='+ 'user_role_' + active_user.unique_id +'>';
  userRoles.forEach(function(state){
    //console.log(asset.storage_location, ' ',state.state_enum);
      if(parseInt(active_user.role) === state.state_enum){
        html += '<option selected value="'+ state.state_name + '">'+ state.state_name + '</option>';
      }else{
        html += '<option value="'+ state.state_name + '">'+ state.state_name + '</option>';
      }
  });
  html += '</select></td>';

  html +='<td colspan="1">'+ 'Facility: <br/><select id='+ 'user_facility_' + active_user.unique_id +'>';
  listFacilities.forEach(function(state){
      console.log(active_user.facility, ' ',state.state_name);
      if(active_user.facility === state.state_name){
        html += '<option selected value="'+ state.state_name + '">'+ state.state_name + '</option>';
      }else{
        html += '<option value="'+ state.state_name + '">'+ state.state_name + '</option>';
      }
  });
  html += '</select></td>';

  //html += '<td>'+active_user.facility+'</td>';

  html += '</tr>';
  html += '</table>';
  $(user_details_page_div).append(html);
}

var user_page_is_active = true;
var user_page_div;
var user_controls_div;
function userPage(){
  asset_page_is_active = false;
  $(asset_div).html('');

  var user_details_page_is_active = false;
  $(user_details_page_div).html('');

  user_page_is_active = true;
  $(user_page_div).html('');

  $(user_controls_div).html('');

  users = global_users;

  var html = '';
  // html += '<button class="btn btn-danger"onclick="draw_inventory_stub()" >Go Back</button>';
  html += '<td><button id='+'new_user'+ ' class="btn btn-success" onclick="userDetails(\'' + '' + '\', \''+'new'+'\')">Add User</button></td>';
  html += '<b>Users Table</b>';
  html += '<input id="user_op_info" type="text name="Operation">';
  html += '<table class="table table-bordered table-striped" id="user_table">';
  html += '<tr><th>No.</th><th>ID</th><th>Role</th><th>Facility</th><th>Actions</th></tr>';
  var count = 0;
  if(users.length !== 0){
    users.forEach(function(user){
      html += '<tr><td>'+(++count)+'</td><td>'+user.unique_id+'</td><td>'+findStateName(userRoles,user.role)+'</td><td>'+user.facility+'</td>';
      var id = 'user_details_' + user.unique_id;
      html += '<td><button id='+id+ ' class="btn btn-success" onclick="userDetails(\'' + user.unique_id + '\', \''+'update'+'\')">Details</button></td>';
      html +='</tr>';
      html += '</tr>';
    });
  }
  html += '</table>';
  $(user_page_div).append(html);

  //html = '';
  //html += '<a href="#" onclick="newUser_Contract()" class="btn btn-success">Add User</a>';
  //$(user_controls_div).append(html);
  document.getElementById("user_op_info").value = user_op_string;
}

function makeUser(role, facility){
  var new_user = {
    unique_id: uuid_hex(),
    role: role,
    facility: facility,
    transaction_list: [],
  };
  return new_user;
}

$(document).ready(function() {
  user_page_div = app_container_top.appendChild(document.createElement('div'));
  user_page_div.classList.add('table-responsive');
  user_controls_div = app_container_top.appendChild(document.createElement('div'));

  user_details_page_div = app_container_top.appendChild(document.createElement('div'));
  user_details_page_div.classList.add('table-responsive');

  var make_users = true;
  if(make_users){
    make_users = false;
    for(var i = 0; i < 3; i++){
      users.push(makeUser(i, 'FACILITY_1'));
    }
  }
  console.log(users);
});
