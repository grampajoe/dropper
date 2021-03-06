var Deployer = require('./deployer');

function deploy(deployerName, options, callback) {
  var deployer = Deployer.get(deployerName, options);

  deployer.on('done', callback);
  deployer.on('error', function(err) {
    callback(err);
  });

  deployer.deploy();
}

exports = module.exports = deploy;
