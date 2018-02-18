var MITSContract = artifacts.require("./MITSContract");

// ordering hack DISPOSED SC transition test requires this be the last item in both lists!
module.exports = function(deployer) {
  deployer.deploy(MITSContract, ["CREATED_PLANT", "IMMATURE","VEGETATIVE_TAGGED","FLOWERING","CUT_GET_WET_WEIGHT","HARVESTED","PACKAGED_TAGGED","ADDED_TO_BATCH","DISPOSED"],["CREATED_BATCH_PACKAGE","INVENTORY","ADDED_TO_MANIFEST","DISPOSED"]);
};
