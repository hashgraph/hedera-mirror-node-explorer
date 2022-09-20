[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)

# hashgraph/hedera-mirror-node-explorer

Visual Explorer for the Hedera Hashgraph DLT.

## Project setup

```shell
npm install
```

### Compiles and hot-reloads for development

```shell
npm run serve
```

### Compiles and minifies for production

```shell
npm run build
```

### Lints and fixes files

```shell
npm run lint
```

### Run unit tests (based on Jest)

```shell
npm run test:unit
```

### Run end-to-end tests (based on Cypress)

```shell
# Run the development server in production mode
npm run serve:prod
# Run the tests interactively
npm run test:e2e 
# Or run the tests in headless browser mode
npm run test:e2e:headless
```

### Run the Explorer locally in Docker

```shell
# build the Docker image of the Explorer
npm run build:docker
# launch the Explorer
docker compose up -d
# then open http://localhost:9090 in your web browser
```

### Customize configuration

#### Branding

The Hedera Mirror Node Explorer UI can be customized by adding a branding
directory which path can be provided by the environment variable *$BRANDING_LOCATION*.
If this variable is not defined a directory *./branding* will be looked for
at the root of the repository.
This directory should have the following structure:

```shell
./assets/brand-product-logo.png
./assets/brand-sponsor-logo.png
./assets/brand-theme.scss
./public/*
```

- The file *brand-product-logo.png* should be a 660x181 PNG file, which, if present, will be
  taken into account by the build and put in the top-left placeholder of the Explorer NavBar.
- The file *brand-sponsor-logo.png* should be a 744x313 PNG file, which, if present, will be
  taken into account by the build and put in the bottom-right placeholder of the Explorer footer.
- The file *brand-theme.scss* may provide a modified version of the file located under
  *./src/assets/styles/brand-theme.scss* and, if present, will supersede it.
- Any file present in the *./public/* directory will be added to the content of the 
  *./public* directory, which allows to customize the favicon.

#### Running the Explorer with a local mirror node

The Explorer can be used with a local mirror by means of a .env file located at the root
of the repository and containing the definition of the following variables to add a custom menu
item in the network selector pull-down menu:

```shell
VUE_APP_LOCAL_MIRROR_NODE_URL=\<URL of the local mirror node\>
VUE_APP_LOCAL_MIRROR_NODE_MENU_NAME=\<label of the custom menu item\>
```

The latter may be omitted and will default to 'LOCALNET'

#### Enabling the Staking page

The Staking page allows the user to connect a wallet to the Explorer and to choose to stake her account balance
to a selected network node or to another account.

By default, the Staking page is disabled, and the corresponding menu item is absent from the top navigation bar.
To enable the Staking page and menu item, set the following variable to *true* in the .env file:

```shell
VUE_APP_ENABLE_STAKING=true
```

*Note the user wallet connection only works on Chrome.*

#### Vue CLI

The Hedera Mirror Node Explorer is based on the Vue CLI framework.
See [Configuration Reference](https://cli.vuejs.org/config/) for Vue CLI related aspects.

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
