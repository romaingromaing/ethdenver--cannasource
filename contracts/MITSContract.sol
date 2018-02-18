pragma solidity ^0.4.11;
// We have to specify what version of compiler this code will compile with

import "./strings.sol";

contract MITSContract {

  using strings for *;

  event AddPlantAssetEvent(
    string assetInfo
  );
  event SetPlantStateEvent(
    string assetInfo
  );
  event TestSetPlantStateEvent(
    string assetInfo
  );
  event GetPlantStatesEvent(
    string assetInfo
  );

  event AddPackageAssetEvent(
    string assetInfo
  );
  event SetPackageStateEvent(
    string assetInfo
  );
  event GetPackageStatesEvent(
    string assetInfo
  );

  event UpdateUserEvent(
    string userInfo
  );

  //  debugging events
  event TestOutputStringEvent(
    string s
  );
  event TestOutputBytes32Event(
    bytes32 x
  );
  event TestOutputIntEvent(
    int x
  );

  event AYTEvent(
    string ayt
  );

  bytes32[] public plantStateList;
  uint256 plantStateIndex = 0;

  bytes32[] public packageStateList;
  uint256 packageStateIndex = 0;

  function MITSContract(bytes32[] plantStateNames, bytes32[] packageStateNames) {
      plantStateList = plantStateNames;
      plantStateIndex = 0;
      packageStateList = packageStateNames;
      packageStateIndex = 0;
  }

  // Utility functions
  //https://ethereum.stackexchange.com/questions/29295/how-to-convert-a-bytes-to-string-in-solidity
  function bytes32ToString(bytes32 x) constant returns (string) {
    //TestOutputBytes32Event(x);
    bytes memory bytesString = new bytes(32);
    uint charCount = 0;
    for (uint j = 0; j < 32; j++) {
        byte char = byte(bytes32(uint(x) * 2 ** (8 * j)));
        if (char != 0) {
            bytesString[charCount] = char;
            charCount++;
        }
    }
    bytes memory bytesStringTrimmed = new bytes(charCount);
    for (j = 0; j < charCount; j++) {
        bytesStringTrimmed[j] = bytesString[j];
    }
    return string(bytesStringTrimmed);
  }

  //https://ethereum.stackexchange.com/questions/6591/conversion-of-uint-to-string
  function uintToBytes(uint v) constant returns (bytes32 ret) {
    if (v == 0) {
        ret = '0';
    }
    else {
        while (v > 0) {
            ret = bytes32(uint(ret) / (2 ** 8));
            ret |= bytes32(((v % 10) + 48) * 2 ** (8 * 31));
            v /= 10;
        }
    }
    return ret;
  }

  function compareStrings (string a, string b) view returns (bool){
         return keccak256(a) == keccak256(b);
   }

  function AYT(){
    var s = "AYT".toSlice().concat(",MITS YIA".toSlice());
    AYTEvent(s);
  }

  function addPlantAsset(bytes32 _unique_id, bytes32 _create_op, bytes32 _asset_type, bytes32 _txee_id){
    string memory id = bytes32ToString(_unique_id);
    var create_op = bytes32ToString(_create_op);
    var asset_type = bytes32ToString(_asset_type);
    var txee_id = bytes32ToString(_txee_id);

    var s = create_op.toSlice().concat(",".toSlice());
    s = s.toSlice().concat(asset_type.toSlice());
    s = s.toSlice().concat(",ID,".toSlice());
    s = s.toSlice().concat(id.toSlice());
    s = s.toSlice().concat(",TXEE,".toSlice());
    s = s.toSlice().concat(txee_id.toSlice());
    s = s.toSlice().concat(",Result,".toSlice());
    s = s.toSlice().concat("ALLOWED".toSlice());
    AddPlantAssetEvent(s);
  }

  // set alowed with no regard to "smart contract"
  function setPlantState(bytes32 _unique_id, bytes32 _state_category, int _current_state, int _new_state, bytes32 _txee_id){
    TestOutputStringEvent("Top setPlantState");
    string memory id = bytes32ToString(_unique_id);
    var state_category = bytes32ToString(_state_category);
    var new_state = bytes32ToString(plantStateList[uint256(_new_state)]);
    var current_state = bytes32ToString(plantStateList[uint256(_current_state)]);
    var txee_id = bytes32ToString(_txee_id);
    plantStateIndex = uint256(_new_state);
    var stg_val = uintToBytes(uint(plantStateIndex));
    var state_stg = bytes32ToString(stg_val);

    var s = state_category.toSlice().concat(",ID,".toSlice());
    s = s.toSlice().concat(id.toSlice());
    s = s.toSlice().concat(",current,".toSlice());
    s = s.toSlice().concat(current_state.toSlice());
    s = s.toSlice().concat(",next,".toSlice());
    s = s.toSlice().concat(new_state.toSlice());
    s = s.toSlice().concat(",TXEE,".toSlice());
    s = s.toSlice().concat(txee_id.toSlice());
    s = s.toSlice().concat(",Result,".toSlice());
    s = s.toSlice().concat("ALLOWED".toSlice());
    //s = s.toSlice().concat(",new,".toSlice());
    //s = s.toSlice().concat(state_stg.toSlice());
    SetPlantStateEvent(s);
  }

  // set alowed with no regard to "smart contract"
  function testSetPlantState(bytes32 _unique_id, bytes32 _state_category, int _current_state, int _new_state, bytes32 _txee_id){
    //TestOutputStringEvent("Top testSetPlantState");

        string memory id = bytes32ToString(_unique_id);
        var state_category = bytes32ToString(_state_category);
        var new_state = bytes32ToString(plantStateList[uint256(_new_state)]);
        var current_state = bytes32ToString(plantStateList[uint256(_current_state)]);
        var txee_id = bytes32ToString(_txee_id);
        plantStateIndex = uint256(_new_state);
        //var stg_val = uintToBytes(uint(plantStateIndex));
        //var state_stg = bytes32ToString(stg_val);

        uint256 states_count = (plantStateList.length - 1);
        bytes32 allow_new_state = 'false';
        bytes32 reason = 'OK';
        if(uint256(_current_state) == states_count){
          allow_new_state = 'false';
          reason = 'DISPOSED';
        }else if((uint256(_current_state) + 1) == uint256(_new_state)){
          reason = 'OK';
          allow_new_state = 'true';
        }else{
          allow_new_state = 'false';
          reason = 'OUT_OF_SEQUENCE';
        }
        //var trans_result = bytes32ToString(allow_new_state);
        //TestOutputStringEvent(trans_result);

        var reason_stg = bytes32ToString(reason);
        TestOutputStringEvent(reason_stg);


    var s = state_category.toSlice().concat(",ID,".toSlice());
    s = s.toSlice().concat(id.toSlice());
    s = s.toSlice().concat(",current,".toSlice());
    s = s.toSlice().concat(current_state.toSlice());
    s = s.toSlice().concat(",next,".toSlice());
    s = s.toSlice().concat(new_state.toSlice());
    s = s.toSlice().concat(",TXEE,".toSlice());
    s = s.toSlice().concat(txee_id.toSlice());
    s = s.toSlice().concat(",Result,".toSlice());
    if(allow_new_state == 'true'){
      s = s.toSlice().concat("ALLOWED".toSlice());
    }else{
      s = s.toSlice().concat("NOT_ALLOWED".toSlice());
    }
    s = s.toSlice().concat(",Reason,".toSlice());
    s = s.toSlice().concat(reason_stg.toSlice());
    TestSetPlantStateEvent(s);
  }

  function GetPlantStates(bytes32 _state_category, bytes32 _txee_id){
    var state_category = bytes32ToString(_state_category);
    var txee_id = bytes32ToString(_txee_id);
    var s = state_category.toSlice().concat(",".toSlice());
    for(uint i = 0; i < uint(plantStateList.length); i++){
      s = s.toSlice().concat(bytes32ToString(plantStateList[uint256(i)]).toSlice());
      s = s.toSlice().concat(",".toSlice());
    }
    s = s.toSlice().concat("TXEE,".toSlice());
    s = s.toSlice().concat(txee_id.toSlice());
    s = s.toSlice().concat(",Result,".toSlice());
    s = s.toSlice().concat("ALLOWED".toSlice());
    GetPlantStatesEvent(s);
  }

  function addPackageAsset(bytes32 _unique_id, bytes32 _create_op, bytes32 _asset_type, bytes32 _txee_id){
    string memory id = bytes32ToString(_unique_id);
    var create_op = bytes32ToString(_create_op);
    var asset_type = bytes32ToString(_asset_type);
    var txee_id = bytes32ToString(_txee_id);

    var s = create_op.toSlice().concat(",ID,".toSlice());
    s = s.toSlice().concat(id.toSlice());
    s = s.toSlice().concat(",".toSlice());
    s = s.toSlice().concat(asset_type.toSlice());
    s = s.toSlice().concat(",TXEE,".toSlice());
    s = s.toSlice().concat(txee_id.toSlice());
    s = s.toSlice().concat(",Result,".toSlice());
    s = s.toSlice().concat("ALLOWED".toSlice());
    AddPackageAssetEvent(s);
  }

  // set alowed with no regard to "smart contract"
  function setPackageState(bytes32 _unique_id, bytes32 _state_category, int _current_state, int _new_state, bytes32 _txee_id){
    TestOutputStringEvent("Top setPackageState");
    string memory id = bytes32ToString(_unique_id);
    var state_category = bytes32ToString(_state_category);
    var new_state = bytes32ToString(packageStateList[uint256(_new_state)]);
    var current_state = bytes32ToString(packageStateList[uint256(_current_state)]);
    var txee_id = bytes32ToString(_txee_id);
    packageStateIndex = uint256(_new_state);
    var stg_val = uintToBytes(uint(_state_category));
    var state_stg = bytes32ToString(stg_val);

    var s = state_category.toSlice().concat(",ID,".toSlice());
    s = s.toSlice().concat(id.toSlice());
    s = s.toSlice().concat(",current,".toSlice());
    s = s.toSlice().concat(current_state.toSlice());
    s = s.toSlice().concat(",next,".toSlice());
    s = s.toSlice().concat(new_state.toSlice());
    s = s.toSlice().concat(",TXEE,".toSlice());
    s = s.toSlice().concat(txee_id.toSlice());
    s = s.toSlice().concat(",Result,".toSlice());
    s = s.toSlice().concat("ALLOWED,new,".toSlice());
    s = s.toSlice().concat(state_stg.toSlice());
    SetPackageStateEvent(s);
  }

  function GetPackageStates(bytes32 _state_category, bytes32 _txee_id){
    var state_category = bytes32ToString(_state_category);
    var txee_id = bytes32ToString(_txee_id);
    var s = state_category.toSlice().concat(",".toSlice());
    for(uint i = 0; i < uint(packageStateList.length); i++){
      s = s.toSlice().concat(bytes32ToString(packageStateList[uint256(i)]).toSlice());
      s = s.toSlice().concat(",".toSlice());
    }
    s = s.toSlice().concat("TXEE,".toSlice());
    s = s.toSlice().concat(txee_id.toSlice());
    s = s.toSlice().concat(",Result,".toSlice());
    s = s.toSlice().concat("ALLOWED".toSlice());
    GetPackageStatesEvent(s);
  }

  function updateUser(bytes32 _unique_id, bytes32 _create_op, bytes32 _asset_type, bytes32 _txee_id){
    string memory id = bytes32ToString(_unique_id);
    var create_op = bytes32ToString(_create_op);
    var asset_type = bytes32ToString(_asset_type);
    var txee_id = bytes32ToString(_txee_id);

    var s = create_op.toSlice().concat(",ID,".toSlice());
    s = s.toSlice().concat(id.toSlice());
    s = s.toSlice().concat(",".toSlice());
    s = s.toSlice().concat(asset_type.toSlice());
    s = s.toSlice().concat(",TXEE,".toSlice());
    s = s.toSlice().concat(txee_id.toSlice());
    s = s.toSlice().concat(",Result,".toSlice());
    s = s.toSlice().concat("ALLOWED".toSlice());
    UpdateUserEvent(s);
  }
}
