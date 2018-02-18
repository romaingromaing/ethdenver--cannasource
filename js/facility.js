var facility = {
  unique_id: '',
  name: '',
};

var room = {
  unique_id: '',
  name: '',
  facility: '',
};

var enumFacilities = {
  NONE: 0,
  FACILITY_1: 1,
  FACILITY_2: 2,
}

var listFacilities = [
    {
      state_name: 'NONE',
      state_enum:  enumFacilities.NONE
    },{
      state_name: 'FACILITY_1',
      state_enum:  enumFacilities.FACILITY_1
    },{
      state_name: 'FACILITY_2',
      state_enum:  enumFacilities.FACILITY_2
    }
];

facility = {
  unique_id: uuid_hex(),
  name: 'FACILITY_1',
  rooms: [],
}

var enumLighting = {
  OFF: 0,
  ON_24: 1,
  ON_12_OFF_12: 2,
}

var listLighting = [
    {
      state_name: 'OFF',
      state_enum:  enumFacilities.OFF
    },{
      state_name: 'ON_24',
      state_enum:  enumFacilities.ON_24
    },{
      state_name: 'ON_12_OFF_12',
      state_enum:  enumFacilities.ON_12_OFF_12
    }
];

plant_room = {
  unique_id: uuid_hex(),
  name: 'Plant Room',
  facility: 'FACILITY_1',
  temp: '',
  humidity: '',
  air_flow: '',
  lock: '',
  update_time: '',
  light: 'ON_24',
};

package_room = {
  unique_id: uuid_hex(),
  name: 'Package Room',
  facility: 'FACILITY_1'
};

function draw_plant_stub(){
  plant_page_is_active = true;
  $(plant_page_div).html('');
  $(plant_controls_div).html('');

  plant_room_page_is_active = false;
  $(plant_room_table_div).html('');
  plantPage();
}

// IOT:
// environmental: temp, humidity, CO2, air_flow
// secuirty: door <OPEN,LOCKED>

var iot_refresh_period = 6000;

var plant_room_table_div;
var plant_room_page_is_active = false;
function plantRoomPage(){
  plant_page_is_active = false;
  $(plant_page_div).html('');
  $(plant_controls_div).html('');

  plant_room_page_is_active = true;
  $(plant_room_table_div).html('');

  var html = '<button class="btn btn-danger"onclick="draw_plant_stub()" >Go Back</button>';
  html += '&nbsp;IoT Refresh(s): <input type="text" id="iot_refresh">';
  html += '<button class="btn btn-success"onclick="setRefresh()" >Set</button>';
  html += '<table class="table table-bordered table-striped" id="storage_table">';
  html += '<tr><th>Room</th><th>Temp(&deg;F)</th><th>Humidity(%)</th><th>Air Flow</th><th>Lock</th><th>Update Time</th><th>Light</th></tr>';
  html += '<tr><td>'+'Plant Room'+'</td><td>'+plant_room.temp+'</td><td>'+plant_room.humidity+'</td><td>'+plant_room.air_flow+'</td><td>'+plant_room.lock+'</td><td>'+convertTimeLocal(plant_room.update_time)+'</td>';
  html += '<td>'+plant_room.light+'</td></tr>';
  html += '</table>';
  $(plant_room_table_div).append(html);

  $("#iot_refresh").val(iot_refresh_period / 1000);
}

function simIoTDataPlantRoom(){
  plant_room.temp = Math.floor((Math.random()*15) + 75); // 75 - 85
  plant_room.humidity = Math.floor((Math.random()*10) + 70); // 80 + (0 - 2)
  plant_room.air_flow = Math.floor((Math.random()*10)); // 0 - 10 units
  var lock_test = Math.random();
  //console.log("lock_test: ", lock_test);
  plant_room.lock =  lock_test < 0.5 ? 'LOCKED' : 'UNLOCKED';
  plant_room.update_time = parseFloat(new Date().getTime() / 1000.0);
}

function timerLoop(){
  simIoTDataPlantRoom();
  if(plant_room_page_is_active){
    plantRoomPage();
  }
  setTimeout(timerLoop, iot_refresh_period);
}

function facilityPage(){
  console.log("facilityPage");
}

$(document).ready(function(){
    plant_room_table_div = app_container_top.appendChild(document.createElement('div'));
    plant_room_table_div.classList.add('table-responsive');
    timerLoop();
});
