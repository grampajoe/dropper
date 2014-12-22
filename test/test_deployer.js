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

    it('should automatically subclass itself', function() {
      var deployer;

      function FakeDeployer() {}

      Deployer.register('fake', FakeDeployer);

      deployer = Deployer.get('fake');

      deployer.should.be.an.instanceOf(Deployer);
    });
  });

  describe('#deploy', function() {
    it('should emit a not implemented error', function(done) {
      var deployer = new Deployer();

      deployer.on('error', function(err) {
        err.should.match(/not implemented/i);
        done();
      });

      deployer.deploy();
    });
  });
});
