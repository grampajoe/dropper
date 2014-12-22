var should = require('should'),
    sinon = require('sinon'),
    cli = require('../lib/cli');

describe('$ deploy', function() {
  var deployStub = sinon.stub(),
      requiredOptions = [
        'node',
        '/path/to/deploy.js',
        'deployer',
      ];

  beforeEach(function() {
    deployStub.reset();

    sinon.stub(console, 'error');
    sinon.stub(console, 'info');
    sinon.stub(process, 'exit');
  });

  afterEach(function() {
    console.error.restore();
    console.info.restore();
    process.exit.restore();
  });

  describe('deployer', function() {
    it('should be required', function() {
      var options = [
        'node',
        '/path/to/deploy.js',
      ];

      cli(options, deployStub);

      debugger;
      console.error.getCall(0).args[0].should.match(/Deployer is required./);
      process.exit.calledWith(1).should.be.ok;
    });
  });

  it('should call the main deploy function', function() {
    cli(requiredOptions, deployStub);

    deployStub.called.should.be.ok;
  });

  it('should call deploy with passed-in args', function() {
    var options = [
          'node',
          '/path/to/deploy.js',
          'dummy',
          '--test-arg=wow',
          '--butt'
        ],
        deployer,
        args;

    cli(options, deployStub);
    deployer = deployStub.getCall(0).args[0];
    args = deployStub.getCall(0).args[1];

    deployer.should.equal('dummy');
    args.testArg.should.equal('wow');
    args.butt.should.be.ok;
  });

  it('should pass a callback to deploy', function() {
    var callback = sinon.stub();

    cli(requiredOptions, deployStub, callback);

    deployStub.getCall(0).args[2].should.eql(callback);
  });

  it('should exit with a failed status on errors', function() {
    var callback;

    cli(requiredOptions, deployStub);
    callback = deployStub.getCall(0).args[2];

    callback('Error!')

    process.exit.calledWith(1).should.be.ok;
  });

  it('should log errors', function() {
    var callback;

    cli(requiredOptions, deployStub);
    callback = deployStub.getCall(0).args[2];

    callback('Error!')

    console.error.getCall(0).args[0].should.match(/error/i);
  });
});
