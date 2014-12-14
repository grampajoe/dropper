var Deployer = require('./deployer');

function deploy(deployerName, options, callback) {
  var deployer = Deployer.get(deployerName),
      cleaned = deployer.cleanOptions(options);

  deployer.deploy(cleaned, callback);
}

exports = module.exports = deploy;
