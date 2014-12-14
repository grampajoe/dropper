var should = require('should'),
    sinon = require('sinon'),
    deploy = require('../lib/dropper'),
    Deployer = require('../lib/deployer');

describe('deploy', function() {
  it('should call deployer.deploy', function() {
    var options = {'hello': 'hi'},
        callback = sinon.stub(),
        cleaned = {'cleaned': 'options'};

    function FakeDeployer() {};
    FakeDeployer.prototype.deploy = sinon.stub();
    FakeDeployer.prototype.cleanOptions = sinon.stub()
      .returns(cleaned);
    Deployer.register('fake', FakeDeployer);

    deploy('fake', options, callback);

    new FakeDeployer().deploy.calledWith(
      cleaned,
      callback
    ).should.be.ok;
  });
});
