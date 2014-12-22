var Deployer = require('../deployer');

function DummyDeployer(options) {
  this.options = options;
};

DummyDeployer.prototype.__proto__ = Deployer.prototype;

DummyDeployer.prototype.deploy = function() {
  this.emit('done');
};

Deployer.register('dummy', DummyDeployer);

exports = module.exports = DummyDeployer;
