function DummyDeployer(options) {
  this.options = options;
};

DummyDeployer.prototype.deploy = function() {
  this.emit('done');
};

exports = module.exports = DummyDeployer;
