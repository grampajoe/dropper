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

  it('should raise errors', function() {
    function FakeDeployer() {}
    FakeDeployer.prototype.__proto__ = EventEmitter.prototype;
    FakeDeployer.prototype.deploy = function() {
      this.emit('error', new Error('oh no!'));
    };

    Deployer.register('fake', FakeDeployer);

    (function() {
      deploy('fake', {}, function() {});
    }).should.throw(/oh no/);
  });
});
