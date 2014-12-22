var should = require('should'),
    sinon = require('sinon'),
    deploy = require('../lib/dropper'),
    Deployer = require('../lib/deployer'),
    EventEmitter = require('events').EventEmitter;

describe('deploy', function() {
  it('should call deployer.deploy', function(done) {
    var options = {'hello': 'hi'};

    function callback() {
      done();
    }

    function FakeDeployer(passed_options) {
      passed_options.should.eql(options);
    };

    FakeDeployer.prototype.__proto__ = EventEmitter.prototype;
    FakeDeployer.prototype.deploy = function() {
      this.emit('done');
    }

    Deployer.register('fake', FakeDeployer);

    deploy('fake', options, callback);
  });

  it('should send errors to the callback', function(done) {
    var error = new Error('oh no!');

    function FakeDeployer() {}
    FakeDeployer.prototype.__proto__ = EventEmitter.prototype;
    FakeDeployer.prototype.deploy = function() {
      this.emit('error', error);
    };

    Deployer.register('fake', FakeDeployer);

    deploy('fake', {}, function(err) {
      err.should.equal(error);
      done();
    });
  });
});
