[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)

# hashgraph/hedera-mirror-node-explorer

Visual Explorer for the Hedera Hashgraph DLT.

## Project setup

```shell
npm install
```

## Build

### Compile and hot-reload for development

```shell
npm run dev
```

### Compile and minify for production

```shell
npm run build
```

### Lint files (find and fix problems)

```shell
npm run lint
```

## Test

### Run unit tests (based on Jest)

```shell
npm run test:unit
```

### Run end-to-end tests (based on Cypress)

```shell
# Run the tests interactively
npm run test:e2e:dev 
# Or run the tests in headless browser mode
npm run test:e2e
```

## Configuration

The configuration of the explorer is based on these 2 files, which need to be found at the root of the app in order for the
Explorer to start:
- `/public/core-config.json`
- `/public/networks-config.json`

Details for these configuration files can be found in the [Configuration Guide](https://github.com/hashgraph/.github/blob/configuration/CONFIGURATION.md).

## Run in Docker

```shell
# Build the Docker image locally
npm run docker:build

# Copy and adjust configuration of Hedera networks as needed
cp networks-config-http-example.json networks-config.json

# Start the Docker container
# (if not built locally, this will fetch a pre-built image from Google Container Registry)
npm run docker:start
open http://127.0.0.1:8080

# Stop the Docker container
npm run docker:stop

# then open http://localhost:8080 in your web browser
```

## Run in Kubernetes

To run in [Kubernetes](https://kubernetes.io) the hedera-explorer [Helm](https://helm.sh) chart can be used. First,
obtain access to a Kubernetes cluster running version 1.23 or greater. [Minikube](https://minikube.sigs.k8s.io/docs/)
can be used for a local Kubernetes cluster.

```shell
helm upgrade --install hedera-explorer chart/
```

### Configure custom networks 

Core configuration and network configuration need to be provided to the Explorer in the `values.yaml` file 
(see [Configuration Guide](https://github.com/hashgraph/.github/blob/main/CONFIGURATION.md) for 
details on configuration parameters).

If the network configuration is empty, by default the Explorer will support MAINNET, PREVIEWNET and TESTNET. But a 
custom list of network can be provided, to either extend or completely replace the list of networks supported.

An example:
```
 config: |
  [
    {
      "name": "testnet",
      "displayName": "TESTNET",
      "url": "https://testnet.mirrornode.hedera.com/",
      "ledgerID": "01"
    }
  ]
```

## Run local sourcify instance (for smart contract verification)

This set-up uses an nginx reverse proxy in front of the 3 sourcify services (ui, server, repository) in order to
support HTTPS. The SSL set-up is based on a self-signed certificate obtained per the instructions at:
https://letsencrypt.org/docs/certificates-for-localhost/

The design of the repository (itself based on an nginx reverse proxy) is such that it requires to be on a distinct host,
so it cannot be accessed by localhost like ui and server. To this effect you need to define a hostname locally (see below)

```shell
# Define the domain repository.local` used by the repository
bash -c 'echo "127.0.0.1       repository.local" >> /etc/hosts'

# Start sourcify services
# in sourcify-setup directory do:
docker-compose up -d

# Invoke the server API once to make sure your browser accepts the self-signed certificate
open https://localhost/server/chains

# To open the sourcify UI
open https://localhost

# To open the sourcify repository UI
open https://repository.local

# Stop sourcify services
# in sourcify-setup directory do:
docker-compose down
```

## Contributing

Contributions are welcome. Please see the
[contributing guide](https://github.com/hashgraph/.github/blob/main/CONTRIBUTING.md)
to see how you can get involved.

## Code of Conduct

This project is governed by the
[Contributor Covenant Code of Conduct](https://github.com/hashgraph/.github/blob/main/CODE_OF_CONDUCT.md). By
participating, you are expected to uphold this code of conduct. Please report unacceptable behavior
to [oss@hedera.com](mailto:oss@hedera.com).

## License

[Apache License 2.0](LICENSE)
