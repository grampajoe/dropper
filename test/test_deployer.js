var should = require('should'),
    sinon = require('sinon'),
    Deployer = require('../lib/deployer'),
    EventEmitter = require('events').EventEmitter;

describe('Deployer', function() {
  it('should be an event emitter', function() {
    var deployer = new Deployer();

    deployer.should.be.an.instanceOf(EventEmitter);
  });

  describe('.get', function() {
    it('should return a deployer', function() {
      var deployer;

      function FakeDeployer(options) {
        this.options = options;
      }

      Deployer.register('butt', FakeDeployer);

      deployer = Deployer.get('butt', {'option': 'value'})

      deployer.should.be.an.instanceOf(FakeDeployer);
      deployer.options.should.eql({'option': 'value'});
    });

    it('should throw an error for missing deployers', function() {
      (function() {
        Deployer.get('fart');
      }).should.throw(/not found/);
    });
  });

  describe('.register', function() {
    it('should add a deployer', function() {
      var deployer = sinon.stub();

      Deployer.register('butt', deployer);

      Deployer._deployers['butt'].should.equal(deployer);
    });
  });

  describe('#cleanOptions', function() {
    it('should do nothing', function() {
      var deployer = new Deployer(),
          cleaned;

      cleaned = deployer.cleanOptions({'butt': 'fart'});

      cleaned.should.eql({'butt': 'fart'});
    });
  });

  describe('#deploy', function() {
    it('should raise a not implemented exception', function() {
      var deployer = new Deployer();

      deployer.deploy.should.throw(/not implemented/i);
    });
  });
});
