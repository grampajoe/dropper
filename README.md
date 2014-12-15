# dropper

Deploy things!

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
- `--migrate` (optional) Enable migrations.
- `--comment STRING` (optional) Comment for the deployment.

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
