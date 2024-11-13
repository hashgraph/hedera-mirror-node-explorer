# Mirror Node Explorer Configuration

Mirror Node Explorer can be configured using two files:
- core-config.json enables to set global configuration parameters
- networks-config.json specifies networks (ie mainnet, testnet…) that can be explored

#### About optional parameters
Unless specified, parameter values can be absent or `null`. In that case, Explorer applies a default behavior specified in the sections below.

#### About URL parameters
Relative URL can be specified: they are resolved against root directory of the application distrib (the one that contains `index.html`)


## core-config.json

The following configuration parameters can be set in `core-config.json`:

| Parameter Key                  | Type     | When `undefined` or `null`                                                        | Comment                    |
|--------------------------------|----------|-----------------------------------------------------------------------------------|----------------------------|
| `productName`                  | `string` | `Hiero Mirror Node Explorer` is displayed                                         |                            |
| `productLogoURL`               | `url`    | [brand-product-logo.png](src/assets/brand-product-logo.png) is displayed          |                            |
| `documentTitlePrefix`          | `string` | `Hiero` is displayed                                                              | Set to `""` to hide prefix |
| `productDescription`           | `string` | No product description is displayed                                               |                            |
| `metaDescription`              | `string` | Meta tag `name="description"` is unset                                            |                            |
| `metaURL`                      | `url`    | Meta tag `property="og:url"` is unset                                             |                            |
| `builtOnLogoURL`               | `url`    | [built-on-hedera-white.svg](src/assets/built-on-hedera-white.svg) is displayed    |                            |
| `builtOnURL`                   | `url`    | Navigation to technology web site is disabled                                     |                            |
| `sponsorLogoURL`               | `url`    | [brand-sponsor-logo.png](src/assets/branding/brand-sponsor-logo.png) is displayed |                            |
| `sponsorURL`                   | `url`    | Navigation to sponsor web site is disabled                                        |                            |
| `termsOfUseURL`                | `url`    | No terms of use are displayed                                                     |                            |
| `estimatorNotice`              | `string` | No estimator notice is displayed                                                  |                            |
| `walletChooserDisclaimerPopup` | `string` | No wallet chooser disclaimer popup is displayed                                   |                            |
| `googleTagID`                  | `string` | Google Tag is disabled                                                            |                            |
| `ipfsGatewayUrlPrefix`         | `string` | Gateway `https://gateway.pinata.cloud/ipfs/` is used                              |                            |
| `popularTokenIndexURL`         | `url`    | Popular token search is disabled                                                  |                            |
| `cryptoSymbol`                 | `string` | `<span style="color: darkgrey">ℏ</span>` is displayed                             |                            |


### `productName`
This parameter is displayed on bottom left of the page when screen size is small.
Default value is `Mirror Node Explorer`

### `productLogoURL`

### `documentTitlePrefix`
Explorer uses this value to prefix browser window title.
When not specified, no prefix appears.

### `productDescription`

### `metaDescription`

### `metaURL`

### `builtOnLogoURL`

### `builtOnURL`

### `sponsorLogoURL`

### `sponsorURL`

### `termsOfUseURL`

### `estimatorNotice`

### `walletChooserDisclaimerPopup`

### `googleTagID`

### `ipfsGatewayUrlPrefix`

### `popularTokenIndexURL`

### `cryptoSymbol`



## networks-config.json

This files contains an array of network configuration objects.
Explorer checks that this array contains at least one item and aborts otherwise.

### Network Configuration Object

| Parameter Key   | Type     | When `undefined` or `null`        | Comments                            |
|-----------------|----------|-----------------------------------|-------------------------------------|
| `name`          | `string` | n/a                               | This parameter is mandatory         |
| `displayName`   | `string` | `name` is used                    |                                     |
| `url`           | `url`    | n/a                               | This parameter is mandatory         |
| `ledgerID`      | `string` | n/a                               | This parameter is mandatory         |
| `enableWallet`  | `string` | Wallet connection is disabled     |                                     |
| `enableStaking` | `string` | Staking features are disabled     |                                     |
| `enableExpiry`  | `url`    | Expiry related info are hidden    |                                     |
| `enableMarket`  | `url`    | Market data are hidden            |                                     |
| `sourcifySetup` | `object` | Contract verification is disabled | See below for `sourcifySetup` spec. |


### Sourcify Setup Object

| Parameter Key | Type      | When `undefined` or `null` | Comments                    |
|---------------|-----------|----------------------------|-----------------------------|
| `activate`    | `boolean` | Network is activated       |                             |
| `repoURL`     | `string`  | n/a                        | This parameter is mandatory |
| `serverURL`   | `url`     | n/a                        | This parameter is mandatory |
| `verifierURL` | `string`  | n/a                        | This parameter is mandatory |
| `chainID`     | `string`  | n/a                        | This parameter is mandatory |



