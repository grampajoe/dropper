var Deployer = require('../deployer');

function DummyDeployer(options) {
  this.options = options;
};

DummyDeployer.prototype.__proto__ = Deployer.prototype;

DummyDeployer.prototype.deploy = function(callback) {
  callback(null);
};

Deployer.register('dummy', DummyDeployer);

exports = module.exports = DummyDeployer;
