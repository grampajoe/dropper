var Deployer = require('./deployer');

function deploy(deployerName, options, callback) {
  var deployer = Deployer.get(deployerName, options);

  deployer.deploy(callback);
}

exports = module.exports = deploy;
