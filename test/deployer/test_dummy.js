var should = require('should'),
    shared = require('./shared'),
    Deployer = require('../../lib/deployer');

describe('DummyDeployer', function() {
  beforeEach(function() {
    this.deployer = Deployer.get('dummy', {'option': 'value'});
    this.cls = 'DummyDeployer';
  });

  shared.itShouldBeADeployer();

  describe('#deploy', function() {
    it('should call the callback', function(done) {
      this.deployer.deploy(done);
    });
  });

  describe('#options', function() {
    it('should store options from the constructor', function() {
      this.deployer.options.should.eql({'option': 'value'})
    });
  });
});
