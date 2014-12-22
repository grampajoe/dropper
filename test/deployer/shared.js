var Deployer = require('../../lib/deployer');

exports = module.exports;

// Deployers

exports.itShouldBeADeployer = function() {
  it('should register itself', function() {
    this.deployer.constructor.name.should.equal(this.cls);
  });

  it('should inherit from Deployer', function() {
    this.deployer.should.be.an.instanceOf(Deployer);
  });
}

// Options

exports.itShouldBeRequired = function() {
  it('should be required', function(done) {
    var deployer = this.deployer,
        options = this.required,
        flag = this.flag;

    delete options[this.name];

    deployer.on('error', function(err) {
      err.should.match(new RegExp(flag + ' is required'));
      done();
    });

    deployer.cleanOptions(options);
  });
}

exports.itShouldUseTheEnvironment = function() {
  it('should be set by the environment', function() {
    var options = this.required,
        args;

    delete options[this.name];
    process.env[this.envvar] = 'thing-value'

    cleaned = this.deployer.cleanOptions(options);

    cleaned[this.name].should.equal('thing-value');

    // Clean up
    delete process.env[this.envvar];
  });
}
