var Deployer = require('./deployer');

function deploy(deployerName, options, callback) {
  var deployer = Deployer.get(deployerName, options);

  deployer.on('done', callback);

  deployer.deploy();
}

exports = module.exports = deploy;
