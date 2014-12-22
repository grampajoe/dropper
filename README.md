# dropper

Deploy things!

[![Wercker](http://img.shields.io/wercker/ci/548e2bbd6b3ba8733d73de03.svg?style=flat)](https://app.wercker.com/project/bykey/352085a3388f20219a49083723194d0d)
[![npm](http://img.shields.io/npm/v/dropper.svg?style=flat)](https://www.npmjs.com/package/dropper)

## Installing

```bash
$ npm install -g dropper
```

## Platforms

Dropper is built to be extensible. The first platform supported is OpsWorks,
but maybe there are more to come!

### Opsworks

Deploy an OpsWorks app:

```bash
$ dropper opsworks --stack-id STRING --app-id STRING
```

#### Options

- `--access-key-id STRING` (required) AWS access key. Can be provided by the
  `AWS_ACCESS_KEY_ID` environment variable.
- `--secret-access-key STRING` (required) AWS secret key. Can be provided by
the `AWS_SECRET_ACCESS_KEY` environment variable.
- `--stack-id STRING` (required) OpsWorks stack ID.
- `--app-id STRING` (required) OpsWorks app ID.
- `--region STRING` (required) AWS region. Default is `us-east-1`. Can be
provided by the `AWS_DEFAULT_REGION` environment variable.
- `--revision STRING` (optional) A revision, e.g. a git ref or subversion
  revision number, to deploy.
- `--migrate` (optional) Enable migrations.
- `--comment STRING` (optional) Comment for the deployment.

#### Permissions

It's recommended to create an [IAM](http://aws.amazon.com/iam/) user with
just enough permissions to perform the actions required to deploy an app.
following permissions should be enough:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "opsworks:CreateDeployment",
        "opsworks:DescribeApps"
      ],
      "Resource": [
        "arn:aws:opsworks:*:*:stack/your-opsworks-stack-id-here/"
      ]
    }
  ]
}
```

## Tests

To run the tests:

```bash
$ npm install
$ npm test
```

## Contributing

1. Fork the [GitHub repo](https://github.com/grampajoe/dropper).
2. Check out a feature branch, e.g. `cool-new-thing`.
3. Write tests!
4. Write code!
5. Open a pull request on GitHub.

## License

MIT. See [LICENSE](LICENSE).
