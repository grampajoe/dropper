var should = require('should'),
    sinon = require('sinon'),
    deploy = require('../lib/dropper'),
    Deployer = require('../lib/deployer');

describe('deploy', function() {
  it('should call deployer.deploy', function(done) {
    var options = {'hello': 'hi'},
        callback = sinon.stub(),
        cleaned = {'cleaned': 'options'};

    function FakeDeployer(passed_options) {
      passed_options.should.eql(options);
      done();
    };

    FakeDeployer.prototype.deploy = sinon.stub();
    Deployer.register('fake', FakeDeployer);

    deploy('fake', options, callback);

    FakeDeployer.prototype.deploy.calledWith(
      callback
    ).should.be.ok;
  });
});
