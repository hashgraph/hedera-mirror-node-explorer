[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)

# hashgraph/hedera-mirror-node-explorer

Visual Explorer for the Hedera Hashgraph DLT.

## Project setup

```shell
npm install
```

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

### Run the Explorer in Docker

```shell
# Build the Docker image locally
npm run docker:build

# Start the Docker container
# (if not built locally, this will fetch a pre-built image from Google Container Registry)
npm run docker:start
open http://127.0.0.1:8080

# Stop the Docker container
npm run docker:stop

# then open http://localhost:8080 in your web browser
```

### Run in Kubernetes

To run in [Kubernetes](https://kubernetes.io) the hedera-explorer [Helm](https://helm.sh) chart can be used. First,
obtain access to a Kubernetes cluster running version 1.23 or greater. [Minikube](https://minikube.sigs.k8s.io/docs/)
can be used for a local Kubernetes cluster.

```shell
helm upgrade --install hedera-explorer chart/
```

#### Specify custom network (can also be used for development)

By default the hedera explorer has support for MAINNET, PREVIEWNET and TESTNET. If you want to add or remove more networks
you can specify it using the `customNetworkConfig` in the `values.yaml` file

An example:

```
 config: |
  [
    {
      "name": "mainnet",
      "displayName": "MAINNET",
      "url": "https://mainnet-public.mirrornode.hedera.com/",
      "ledgerID": "00"
    },
    {
      "name": "testnet",
      "displayName": "TESTNET",
      "url": "https://testnet.mirrornode.hedera.com/",
      "ledgerID": "01"
    },
    {
      "name": "previewnet",
      "displayName": "PREVIEWNET",
      "url": "https://previewnet.mirrornode.hedera.com/",
      "ledgerID": "02"
    },
    {
      "name": "local",
      "displayName": "LOCALNET",
      "url": "/",
      "ledgerID": "03"
    }
  ]
```

### Configure the Explorer

#### FOR DEVELOPMENT PURPOSES: Docker configuration

When running the explorer in Docker, for instance with a Local Node, it is possible
to add a network to the list of available networks configured at build time -- see below.
This is achieved by defining the variable `DOCKER_LOCAL_MIRROR_NODE_URL`
(and optionally `DOCKER_LOCAL_MIRROR_NODE_MENU_NAME`) in the `.env.docker` file,
which will be taken into account at start time by Docker. For instance:

```shell
DOCKER_LOCAL_MIRROR_NODE_MENU_NAME=LOCAL NODE        # Optional, defaults to 'DEVNET'
DOCKER_LOCAL_MIRROR_NODE_URL=http://localhost:5551
```

#### Customize the available networks

The list of networks available in the network selector (top navigation bar)
can be configured in the file `/public/networks-config.json`.
This JSON file contains an array of entries with the following syntax:

```shell
[
  ...
  {
    "name": "mainnet",
    "displayName": "MAINNET",
    "url": "https://mainnet-public.mirrornode.hedera.com/",
    "ledgerID": "00"
  },
  ...
]
```

This file initially contains the configuration allowing to connect to the
_mainnet/testnet/previewnet_ networks. This configuration may be augmented, altered or
replaced as needed.
Note:

-   When this file is missing, is empty, or does not have the expected syntax,
    the configuration falls back to _mainnet/testnet/previewnet_.
-   The `name` of the network has to be unique
-   The `displayName` is the string inserted in the network selector.
    It will default to the network `name` in uppercase. A `displayName`
    exceeding 15 characters will be truncated.
-   The `ledgerID` is required to process the ID checksums shown in the UI.
-   The maximum number of networks taken into account is 15. The rest will be ignored.

#### Customize the UI

A few aspects of the Explorer UI, such as the product name displayed at the bottom of the pages,
are controlled by environment variables defined in the `.env` file. These will be taken into
account at build time.

#### Enabling the Staking page

The Staking page allows the user to connect a wallet to the Explorer and to choose to stake her account balance
to a selected network node or to another account.

By default, the Staking page is disabled, and the corresponding menu item is absent from the top navigation bar.
To enable the Staking page and menu item, set the following variable to _true_ in the .env file:

```shell
VITE_APP_ENABLE_STAKING=true
```

### Customize configuration

#### Branding

In addition to the configuration variables described above,
the Hedera Mirror Node Explorer UI can be customized by adding a branding
directory which path can be provided by the environment variable _$BRANDING_LOCATION_.
If this variable is not defined a directory _./branding_ will be looked for
at the root of the repository.
This directory should have the following structure:

```shell
./assets/brand-product-logo.png
./assets/brand-sponsor-logo.png
./assets/brand-theme.scss
./public/*
```

-   The file `brand-product-logo.png` should be a 660x181 PNG file, which, if present, will be
    taken into account by the build and put in the top-left placeholder of the Explorer NavBar.
-   The file `brand-sponsor-logo.png` should be a 744x313 PNG file, which, if present, will be
    taken into account by the build and put in the bottom-right placeholder of the Explorer footer.
-   The file `brand-theme.scss` may provide a modified version of the file located under
    `./src/assets/styles/brand-theme.scss` and, if present, will supersede it.
-   Any file present in the `./public/` directory will be added to the content of the
    `dist/` directory, which allows to customize the favicon.

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
