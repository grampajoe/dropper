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
    it('should fire a done event', function(done) {
      this.deployer.on('done', done);

      this.deployer.deploy();
    });
  });

  describe('#options', function() {
    it('should store options from the constructor', function() {
      this.deployer.options.should.eql({'option': 'value'})
    });
  });
});
