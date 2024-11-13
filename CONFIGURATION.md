# Mirror Node Explorer Configuration

Mirror Node Explorer can be configured using two files:
- core-config.json enables to set global configuration parameters
- networks-config.json specifies networks (ie mainnet, testnet…) that can be explored

## core-config.json

The following configuration parameters can be set in `core-config.json`:

| Parameter Key                  | Type     | When `undefined` or `null`                                               | Comment                    |
|--------------------------------|----------|--------------------------------------------------------------------------|----------------------------|
| `productName`                  | `string` | `Mirror Node Explorer` is displayed                                      |                            |
| `productLogoURL`               | `url`    | [brand-product-logo.png](src/assets/brand-product-logo.png) is displayed |                            |
| `documentTitlePrefix`          | `string` | `Hiero` is displayed                                                     | Set to `""` to hide prefix |
| `productDescription`           | `string` |                                                                          |                            |
| `metaDescription`              | `string` |                                                                          |                            |
| `metaURL`                      | `url`    |                                                                          |                            |
| `builtOnLogoURL`               | `url`    |                                                                          |                            |
| `builtOnURL`                   | `url`    |                                                                          |                            |
| `sponsorLogoURL`               | `url`    |                                                                          |                            |
| `sponsorURL`                   | `url`    |                                                                          |                            |
| `termsOfUseURL`                | `url`    |                                                                          |                            |
| `estimatorNotice`              | `string` |                                                                          |                            |
| `walletChooserDisclaimerPopup` | `string` |                                                                          |                            |
| `googleTagID`                  | `string` |                                                                          |                            |
| `ipfsGatewayUrlPrefix`         | `string` | `https://gateway.pinata.cloud/ipfs/`                                     |                            |
| `popularTokenIndexURL`         | `url`    |                                                                          |                            |
| `cryptoSymbol`                 | `string` |                                                                          |                            |

Note: relative url are resolved against deployment root directory.

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

This files contains an array of network configuration object.
Explorer checks that this array contains at least one item and aborts if the array is empty.

A network configuration object should contains the following parameters:

| Parameter Key   | Type     | Default   |
|-----------------|----------|-----------|
| `name`          | `string` | Mandatory |
| `url`           | `url`    | Mandatory |
| `ledgerID`      | `string` | Mandatory |
| `enableWallet`  | `string` |           |
| `enableStaking` | `string` |           |
| `enableExpiry`  | `url`    |           |
| `enableMarket`  | `url`    |           |


### `name`

### `url`

### `ledgerID`

### `enableWallet`

### `enableStaking`

### `enableExpiry`

### `enableMarket`


