function getImageName(type){
  var image_name = '';
  if(type === 'life_cycle'){
    image_name = 'img/mari_life_cycle.png'
  }else if(type === 'rules'){
    image_name = 'img/pro_1.png'
  }
  return image_name;
}

var state_table_div;
var state_table_active = false;
function stateInfoPage(){
    asset_page_is_active = false;
  $(asset_div).html('');

  state_table_active = true;
  $(state_table_div).html('');

  var html = '';
  // html += '<button class="btn btn-danger"onclick="draw_inventory_stub()" >Go Back</button>';
  html += '<table class="table table-bordered table-striped" id="state_table">';
  html += '<tr><th>Life Cycle</th><th>Rules</th</tr>';
  html += '<tr><td class="col-xs-6">'+"<img id='myImg' src='"+ getImageName('life_cycle') + "' image_name height='590'>" + '</td>';
  html += '<td class="col-xs-6">'+"<img id='myImg' src='"+ getImageName('rules') + "' image_name height='590'>" + '</td>';
  html += '</tr>';
  html += '</table>';
  $(state_table_div).append(html);
}

$(document).ready(function(){
    state_table_div = app_container_top.appendChild(document.createElement('div'));
    state_table_div.classList.add('table-responsive');
});
