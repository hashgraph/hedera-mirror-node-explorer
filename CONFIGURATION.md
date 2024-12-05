# Mirror Node Explorer Configuration

Mirror Node Explorer can be configured using two files:
- [core-config.json](https://github.com/hashgraph/hedera-mirror-node-explorer/blob/main/public/core-config.json) enables to set global configuration parameters
- [networks-config.json](https://github.com/hashgraph/hedera-mirror-node-explorer/blob/main/public/networks-config.json) specifies the networks (ie mainnet, testnet…) that can be explored as well as network-specific configuration parameters.

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
| `builtOnLogoURL`               | `url`    | [technology-logo.svg](src/assets/technology-logo.svg) is displayed                |                            |
| `builtOnURL`                   | `url`    | Navigation to technology web site is disabled                                     |                            |
| `sponsorLogoURL`               | `url`    | [brand-sponsor-logo.png](src/assets/branding/brand-sponsor-logo.png) is displayed |                            |
| `sponsorURL`                   | `url`    | Navigation to sponsor web site is disabled                                        |                            |
| `termsOfUseURL`                | `url`    | No terms of use are displayed                                                     |                            |
| `estimatorNotice`              | `string` | No estimator notice is displayed                                                  |                            |
| `walletChooserDisclaimerPopup` | `string` | No wallet chooser disclaimer popup is displayed                                   |                            |
| `googleTagID`                  | `string` | Google Tag is disabled                                                            |                            |
| `cookiesDialogContent`         | `string` | No cookies acceptation dialog (hence Google Tag is disabled)                      |                            |
| `ipfsGatewayURL`               | `string` | Gateway `https://gateway.pinata.cloud/ipfs/` is used                              |                            |
| `arweaveServerURL`             | `string` | The `https://arweave.net/` URL is used                                            |                            |
| `cryptoName`                   | `string` | `HBAR` is displayed                                                               |                            |
| `cryptoSymbol`                 | `string` | `<span style="color: darkgrey">ℏ</span>` is displayed                             |                            |
| `walletConnectID`              | `string` | Wallet Connect is disabled                                                        |                            |


### `productName`
This parameter is displayed on bottom left of the page when screen size is small.
Default value is `Hiero Mirror Node Explorer`

### `productLogoURL`
This provides the location of an image to be used as a replacement for the default product logo at the top left of the page.
It can be either:
- the file path of an image located at the root of the application (e.g. `/my-own-brand-logo.svg`)
- the URL of an image on the network (e.g. `https://my-own-server.com/my-own-brand-logo.svg`)

### `documentTitlePrefix`
Explorer uses this value to prefix browser window title.
If not specified, no prefix appears.

### `productDescription`
This parameter is displayed on bottom left of the page when screen size is large.
Default value is `Hiero Mirror Node Explorer`

### `metaDescription`
This parameter will be inserted as the meta tag `name="description"` in index.html.
If not specified, the meta tag is not inserted.

### `metaURL`
This parameter will be inserted as the meta tag `property="og:url"` in index.html.
If not specified, the meta tag is not inserted.

### `builtOnLogoURL`
This provides the location of an image to be used as a replacement for the default technology logo at the bottom left of the page.
It can be either:
- the file path of an image located at the root of the application (e.g. `/my-own-builton-logo.svg`)
- the URL of an image available on the network (e.g. `https://my-own-server.com/my-own-builton-logo.svg`)

### `builtOnURL`
This provides the URL of the technology web site which will be placed as an hyperlink on the technology logo (bottom left).
If not specified, a click on the logo will not trigger any navigation.

### `sponsorLogoURL`
This provides the location of an image to be used as a sponsor logo at the bottom right of the page.
It can be either:
- the file path of an image located at the root of the application (e.g. `/my-own-sponsor-logo.svg`)
- the URL of an image available on the network (e.g. `https://my-own-server.com/my-own-sponsor-logo.svg`)
If not specified, no sponsor logo is displayed.

### `sponsorURL`
This provides the URL of the sponsor web site which will be placed as an hyperlink on the sponsor logo (bottom right).
If not specified, a click on the logo will not trigger any navigation.

### `termsOfUseURL`
When specified, this parameter will cause the display of a `See Terms of Service` mention at the bottom of the page,
with a hyperlink allowing to navigate to the given URL.

### `estimatorNotice`
This provides the HTML content of the disclaimer notice displayed at the bottom of the Rewards Estimator section in the
Staking page. If not specified, there is no notice.

### `walletChooserDisclaimerPopup`
This provides the HTML content of the disclaimer popup dialog displayed by the Connect Wallet dialog. 
If not specified, this pop-up dialog is not shown.

### `googleTagID`
This provides the global site tag ID to be used by Google Analytics. If this parameter is specified, and if the user
has agreed to the use of cookies, the google tag ID will be used.

### `cookiesDialogContent`
This provides the HTML content to be used in the cookies acceptation dialog. If this parameter is specified, it will 
trigger the display of a dialog asking the user to agree to the use of cookies before proceeding with the application.
By default, this dialog won't be shown (which also means that the google tag ID will not be used).

### `ipfsGatewayURL`
This provides the URL of the public IPFS gateway to use to resolve the IPFS URIs (or CIDs) found in the token metadata.
By default the Pinata public IPFS gateway is used.

### `arweaveServerURL`
This provides the URL of the Arweave server used to resolve to use to resolve the Arweave URIs (or CIDs) found in the token metadata.
By default the `https://arweave.net/` URL is used.

### `cryptoName`
This provides the name of the crypto, as a replacement of the default name which is 'HBAR'.

### `cryptoSymbol`
This provides the HTML content to be used as a replacement of the default crypto symbol `ℏ`.
For instance, the default value for this parameter is equivalent to providing:
`<span style="color: darkgrey">ℏ</span>`

## networks-config.json

This files contains an array of network configuration objects.
Explorer checks that this array contains at least one item and aborts otherwise.

### Network Configuration Object

| Parameter Key          | Type     | When `undefined` or `null`         | Comments                            |
|------------------------|----------|------------------------------------|-------------------------------------|
| `name`                 | `string` | n/a                                | This parameter is mandatory         |
| `displayName`          | `string` | `name` is used                     |                                     |
| `mirrorNodeURL`        | `url`    | n/a                                | This parameter is mandatory         |
| `ledgerID`             | `string` | n/a                                | This parameter is mandatory         |
| `enableWallet`         | `string` | Wallet connection is disabled      |                                     |
| `enableStaking`        | `string` | Staking features are disabled      |                                     |
| `enableExpiry`         | `url`    | Expiry related info are hidden     |                                     |
| `enableMarket`         | `url`    | Market data are hidden             |                                     |
| `popularTokenIndexURL` | `url`    | Popular token search is disabled   |                                     |
| `sourcifySetup`        | `object` | Contract verification is disabled  | See below for `sourcifySetup` spec. |

### `name`
This provides the official name of the network (e.g. 'testnet').

### `displayName`
The user-friendly name of the network, as displayed in the network selector and the banner on top of the page.

### `mirrorNodeURL`
The URL of the mirror-node REST API for this network.

### `ledgerID`
The ledger ID is an hexadecimal value, as defined by [HIP-198](https://hips.hedera.com/hip/hip-198), which 
uniquely identifies the network.

### `enableWallet`
When set to `true` this parameter enables the `CONNECT WALLET` button, which allows the user to connect a wallet
and perform certain transactions on her account.

### `enableStaking`
When set to `true` this parameter enables the `STAKING` feature, and in particular:
- makes the `Staking` page available
- displays information and properties related to Staking on the various pages
- allow the user to change the Staking for her account

### `enableExpiry`
When set to `true` this parameter enables the display of certain properties related
to the expiry and renewal of accounts and contracts, such as:
- `Expires at`
- `Auto Renew Period`
- `Auto Renew Account`

### `enableMarket`
When set to `true` this parameter enables the display of market related information in the top banner 
of the Dashboard page

### `popularTokenIndexURL`
This provides the location of a file containing a list of 'popular' tokens for the network.
When searching for a token name, this list will be searched separately from the rest of the network tokens,
and the results will be presented in a separate section.

The content of the file is an array of the following structure:
```
[
    {
        "token_id": "0.0.1456986",
        "name": "Wrapped Hbar"
    },
    {
        "token_id": "0.0.834116",
        "name": "HBARX"
    },
    …
]
```


### Sourcify Setup Object

This setup configures the use of a _contract verification server_ based on the
[hedera-sourcify](https://github.com/hashgraph/hedera-sourcify) project.

| Parameter Key | Type      | When `undefined` or `null` | Comments                    |
|---------------|-----------|----------------------------|-----------------------------|
| `activate`    | `boolean` | Network is activated       |                             |
| `repoURL`     | `url`     | n/a                        | This parameter is mandatory |
| `serverURL`   | `url`     | n/a                        | This parameter is mandatory |
| `chainID`     | `string`  | n/a                        | This parameter is mandatory |

### `activate`
When set to `false`, this sourcify setup becomes inactive. Contract verification features are hidden for this network.

### `repoURL`
This provides the URL of the _repository_ service of the contract verification server. This _repository_ service provides REST
endpoints allowing to retrieve the sources files of a verified contract.

### `serverURL`
This provides the URL of the _server_ service of the contract verification server. This _server_ service provides REST
endpoints allowing to check the verification status of a contract, perform the verification process as well as store 
the verification result along with the source files of a contract.

### `chainID`
This provides the integer ID of the chain as a hexadecimal string, as per [EIP-155](https://github.com/ethereum/EIPs/blob/master/EIPS/eip-155.md).


