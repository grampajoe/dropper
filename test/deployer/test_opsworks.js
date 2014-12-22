var should = require('should'),
    sinon = require('sinon'),
    shared = require('./shared'),
    Deployer = require('../../lib/deployer'),
    OpsWorksDeployer = require('../../lib/deployer/opsworks'),
    AWS = require('aws-sdk');

describe('OpsWorksDeployer', function() {
  beforeEach(function() {
    this.required = {
      'accessKeyId': 'access-key-id',
      'secretAccessKey': 'secret-access-key',
      'stackId': 'stack-id',
      'appId': 'app-id',
    };
    this.deployer = Deployer.get('opsworks', this.required);
    this.cls = 'OpsWorksDeployer';

    this.defaults = this.deployer.cleanOptions(this.required);
    this.OpsWorksStub = sinon.stub(AWS, 'OpsWorks');

    this.api = sinon.stub();

    // Stub out a fake describeApps response using the asynchronous style.
    // See http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/OpsWorks.html#describeApps-property
    this.api.describeApps = function() {};
    sinon.stub(this.api, 'describeApps', function(options, callback) {
      return callback(null, {Apps: [{'Shortname': 'short-name'}]});
    });
  });

  afterEach(function() {
    AWS.OpsWorks.restore();
  });

  shared.itShouldBeADeployer();

  describe('#cleanOptions', function() {
    describe('accessKeyId', function() {
      beforeEach(function() {
        this.flag = '--access-key-id';
        this.name = 'accessKeyId';
        this.envvar = 'AWS_ACCESS_KEY_ID';
      });

      shared.itShouldBeRequired();
      shared.itShouldUseTheEnvironment();
    });

    describe('secretAccessKey', function() {
      beforeEach(function() {
        this.flag = '--secret-access-key';
        this.name = 'secretAccessKey';
        this.envvar = 'AWS_SECRET_ACCESS_KEY';
      });

      shared.itShouldBeRequired();
      shared.itShouldUseTheEnvironment();
    });

    describe('stackId', function() {
      beforeEach(function() {
        this.flag = '--stack-id';
        this.name = 'stackId';
      });

      shared.itShouldBeRequired();
    });

    describe('appId', function() {
      beforeEach(function() {
        this.flag = '--app-id';
        this.name = 'appId';
      });

      shared.itShouldBeRequired();
    });

    describe('region', function() {
      beforeEach(function() {
        this.flag = '--region';
        this.name = 'region';
        this.envvar = 'AWS_DEFAULT_REGION';
      });

      shared.itShouldUseTheEnvironment();

      it('should default to us-east-1', function() {
        this.defaults.region.should.equal('us-east-1');
      });
    });

    describe('migrate', function() {
      it('should default to false', function() {
        this.defaults.migrate.should.equal('false');
      });

      it('should be coerced to a string', function() {
        var options = this.required,
            cleaned;
        options.migrate = true;

        cleaned = this.deployer.cleanOptions(options);

        cleaned.migrate.should.equal('true');
      });
    });

    describe('comment', function() {
      it('should default to ""', function() {
        this.defaults.comment.should.equal('');
      });
    });
  });

  describe('#getApi', function() {
    beforeEach(function() {
      this.deployer.options = {
        'accessKeyId': 'access-key-id',
        'secretAccessKey': 'secret-access-key',
        'region': 'region',
      };
    });

    it('should return an AWS.OpsWorks instance', function() {
      var api = this.deployer.getApi();

      api.should.be.an.instanceOf(AWS.OpsWorks);
    });

    it('should pass in the config', function() {
      this.deployer.getApi();

      this.OpsWorksStub.calledWith({
        'accessKeyId': 'access-key-id',
        'secretAccessKey': 'secret-access-key',
        'region': 'region'
      }).should.be.ok;
    });
  });

  describe('#getApp', function() {
    beforeEach(function() {
      this.deployer.options = {'appId': 'app-id'};
      sinon.stub(this.deployer, 'getApi').returns(this.api);
    });

    afterEach(function() {
      this.deployer.getApi.restore();
    });

    it('should call describeApps', function(done) {

      this.deployer.getApp(done);

      this.api.describeApps.calledWith({
        AppIds: ['app-id']
      }).should.be.ok;
    });

    it('should return an app', function(done) {
      var app = this.deployer.getApp(function(err, app) {
        app.should.eql({'Shortname': 'short-name'});
        done();
      });
    });

    it('should cache the app', function(done) {
      var deployer = this.deployer,
          api = this.api;

      deployer.getApp(function(err, first_app) {
        api.describeApps.callCount.should.eql(1);

        deployer.getApp(function(err, second_app) {
          api.describeApps.callCount.should.eql(1);

          second_app.should.be.exactly(first_app);
          done();
        });
      });
    });

    it('should raise API errors', function(done) {
      var deployer = this.deployer;

      this.api.describeApps.restore();
      sinon.stub(this.api, 'describeApps', function(options, callback) {
        callback('whoops');
      });

      deployer.getApp(function(err) {
        err.should.match(/whoops/);
        done();
      });
    });
  });

  describe('#getJSON', function() {
    beforeEach(function() {
      this.app = {'Shortname': 'short-name'};
    });

    it('should return valid JSON', function() {
      JSON.parse(this.deployer.getJSON(this.app)).should.be.ok;
    });

    it('should include the revision', function() {
      var attributes;

      this.deployer.options['revision'] = 'revision-123';

      attributes = JSON.parse(this.deployer.getJSON(this.app));
      attributes.deploy['short-name'].scm.revision.should.eql('revision-123');
    });
  });

  describe('#done', function() {
    it('should send a done event', function(done) {
      var err = 'error!!!!';

      this.deployer.on('done', function(err) {
        err.should.equal(err);
        done();
      });

      this.deployer.done(err);
    });
  });

  describe('#waitForDeploy', function() {
    beforeEach(function() {
      this.api.describeDeployments = function() {};
      sinon.stub(this.api, 'describeDeployments');
      sinon.stub(this.deployer, 'getApi').returns(this.api);
    });

    it('should call describeDeployments', function() {
      this.deployer.waitForDeploy('123');

      this.api.describeDeployments.calledWith({
        'DeploymentIds': ['123']
      }).should.be.ok;
    });

    it('should send a done event', function(done) {
      this.api.describeDeployments = function(options, callback) {
        callback(null, {
          'Deployments': [{'Status': 'successful'}]
        });
      };

      this.deployer.on('done', function() {
        done();
      });

      this.deployer.waitForDeploy('123');
    });

    it('should not send a done event if the deploy failed', function(done) {
      this.api.describeDeployments = function(options, callback) {
        callback(null, {
          'Deployments': [{'Status': 'failed'}]
        });
      };

      this.deployer.on('done', function() {
        done(new Error('Nope!'));
      });

      this.deployer.on('error', function() {
        done();
      });

      this.deployer.waitForDeploy('123');
    });

    it('should keep waiting if the deployment is running', function(done) {
      var deployments = [
            {'Status': 'successful'},
            {'Status': 'running'},
            {'Status': 'running'}
          ],
          api = this.api;

      this.api.describeDeployments.restore();
      sinon.stub(this.api, 'describeDeployments', function(options, callback) {
        var deployment = deployments.pop();

        callback(null, {
          'Deployments': [deployment]
        });
      });

      this.deployer.on('done', function() {
        api.describeDeployments.callCount.should.eql(3);
        done();
      });

      this.deployer.waitForDeploy('123');
    });

    it('should raise describeDeployments errors', function(done) {
      this.api.describeDeployments = function(args, callback) {
        callback('whoops');
      };

      this.deployer.on('error', function(err) {
        err.should.eql('whoops');
        done();
      });

      this.deployer.waitForDeploy('123');
    });
  });

  describe('#deploy', function() {
    beforeEach(function() {
      sinon.stub(this.deployer, 'getApi').returns(this.api);

      sinon.stub(this.deployer, 'getApp', function(callback) {
        callback(null, {'Shortname': 'short-name'});
      });

      this.api.createDeployment = function() {};
      sinon.stub(this.api, 'createDeployment', function(args, callback) {
        callback(null, {'DeploymentId': 'deployment-id'});
      });
    });

    afterEach(function() {
      this.deployer.getApi.restore();
    });

    it('should clean options', function() {
      var deployer = new OpsWorksDeployer({'dirty': 'options'});

      sinon.stub(deployer, 'getApp');
      sinon.stub(deployer, 'cleanOptions').returns(
        {'cleaned': 'options'}
      );

      deployer.options.should.eql({'dirty': 'options'});

      deployer.deploy();

      deployer.options.should.eql({'cleaned': 'options'});
    });

    it('should create a deployment', function() {
      this.deployer.deploy();

      this.api.createDeployment.called.should.be.ok;
    });

    it('should set deployment args', function() {
      var args,
          params,
          callback;

      this.deployer.options = {
        'accessKeyId': '123',
        'secretAccessKey': '123',
        'stackId': 'stack-id',
        'appId': 'app-id',
        'comment': 'comment',
        'migrate': 'true'
      };
      sinon.stub(this.deployer, 'getJSON').returns('{"hello": "world"}');

      this.deployer.deploy();

      args = this.api.createDeployment.getCall(0).args;
      params = args[0];

      params.should.eql({
        Command: {
          Name: 'deploy',
          Args: {
            'migrate': ['true'],
          },
        },
        StackId: 'stack-id',
        AppId: 'app-id',
        Comment: 'comment',
        CustomJson: '{"hello": "world"}'
      });
    });

    it('should pass deployer.done as the callback', function(done) {
      var args,
          callback,
          deployer = this.deployer;

      this.deployer.done = function() {
        this.should.equal(deployer);
        done();
      };

      this.api.createDeployment = function(args, callback) {
        callback();
      };

      this.deployer.deploy();
    });

    it('should optionally wait for deployments to finish', function() {
      this.deployer.waitForDeploy = sinon.stub();
      this.deployer.options.waitForDeploy = true;

      this.deployer.deploy();

      this.deployer.waitForDeploy.calledWith('deployment-id').should.be.ok;
    });

    it('should raise getApp errors', function(done) {
      this.deployer.getApp = function(callback) {
        callback('oh no');
      };

      this.deployer.on('error', function(err) {
        err.should.eql('oh no');
        done();
      });

      this.deployer.deploy();
    });

    it('should raise createDeployment errors', function(done) {
      this.api.createDeployment = function(args, callback) {
        callback('oh no');
      };

      this.deployer.on('error', function(err) {
        err.should.eql('oh no');
        done();
      });

      this.deployer.deploy();
    });
  });
});
