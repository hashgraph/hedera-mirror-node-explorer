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

### Run the Explorer from a pre-built Docker image

```shell
docker compose up -d
# then open http://localhost:8080 in your web browser
```

### Run the Explorer in Docker from an image built locally

```shell
npm run build:docker
npm run docker
# then open http://localhost:8080 in your web browser
```

### Customize configuration

- Variables defined in the *.env* file (located at the root of the repository) will be taken
  into account at build time. 
- Variables defined in the *.env.docker* file will be taken into account at start time of 
  the docker container. Any variable documented in the *.env* file can be overridden in
  the *.env.docker* file. The variables in *.env.docker* are passed to the container either:
  - via the *--env-file* option of the *docker run* command, or
  - via the *env_file:* clause of the *docker-compose.yml* file.

#### Running the Explorer with a local mirror node

Defining the following variables will add a custom menu item to the network selector of 
the top navigation bar. For instance:

```shell
VUE_APP_LOCAL_MIRROR_NODE_URL=http://localhost:5551/
VUE_APP_LOCAL_MIRROR_NODE_MENU_NAME=LOCALNET
```

#### Enabling the Staking page

The Staking page allows the user to connect a wallet to the Explorer and to choose to stake her account balance
to a selected network node or to another account.

By default, the Staking page is disabled, and the corresponding menu item is absent from the top navigation bar.
To enable the Staking page and menu item, set the following variable to *true* in the .env file:

```shell
VUE_APP_ENABLE_STAKING=true
```

#### Branding

In addition to the configuration variables above,
the Hedera Mirror Node Explorer UI can be customized by adding a branding
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
