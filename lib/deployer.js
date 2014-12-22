var EventEmitter = require('events').EventEmitter;

// A base prototype for deployment functionality.
function Deployer() {
}

Deployer.prototype.__proto__ = EventEmitter.prototype;

Deployer._deployers = [];

// Register a deployer.
Deployer.register = function(name, deployer) {
  deployer.prototype.__proto__ = this.prototype;
  Deployer._deployers[name] = deployer;
};

// Get a registered deployer.
Deployer.get = function(name, options) {
  var DeployerClass = Deployer._deployers[name];

  if (DeployerClass == undefined) {
    throw new Error('Deployer "' + name + '" not found!');
  } else {
    return new DeployerClass(options);
  }
};

// Perform the deployment.
Deployer.prototype.deploy = function(options, callback) {
  this.emit('error', 'Not implemented!');
};

exports = module.exports = Deployer;

// Register deployers.
Deployer.register('dummy', require('./deployer/dummy'));
Deployer.register('opsworks', require('./deployer/opsworks'));
