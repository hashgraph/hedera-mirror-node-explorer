# Wallet Acceptance Test

## No wallet extensions

| Prologue                      |
|-------------------------------|
| Start Browser                 |
| Disable all wallet extensions |
| Go to HashScan                |
| Select `testnet`              |

| Action                            | Check                                                                                 |
|-----------------------------------|---------------------------------------------------------------------------------------|
| `Connect Wallet` > `Blade`        | `Blade Extension not found`<br/>`Please install and/or activate Blade extension`      |
| `Connect Wallet` > `Hashpack`     | `Hashpack Extension not found`<br/>`Please install and/or active Blade extension`     |
| `Connect Wallet` > `MetaMask`     | `MetaMask Extension not found`<br/>`Please install and/or active Blade extension`     |
| `Connect Wallet` > `Coinbase`     | `Coinbase Extension not found`<br/>`Please install and/or active Blade extension`     |
| `Connect Wallet` > `Brave Wallet` | `Brave Wallet Extension not found`<br/>`Please install and/or active Blade extension` |


## Wallet extensions installed and enabled

| Prologue                                                            |
|---------------------------------------------------------------------|
| Start Browser                                                       |
| Setup wallet extension (blade, hashpack, metamask, coinbase, brave) |
| - Install and enable extension                                      |
| - Select `testnet`                                                  |
| - Import two ECDSA accounts (A and B)                               |
| Go to HashScan                                                      |


### 1. Connect and timeout

| Action                        | Check                                                                           |
|-------------------------------|---------------------------------------------------------------------------------|
| `Connect Wallet` > `Blade`    | `Connect Wallet` button renamed `Connecting…` and disabled                      |
|                               | Blade wallet window appears<br/>Accounts A and B are available for selection    |
| Wait for timeout              | `Connection to Blade failed`<br/>`Blade wallet is silent`                       |
| `Close`                       |                                                                                 |
|                               |                                                                                 |
| `Connect Wallet` > `HashPack` | `Connect Wallet` button renamed `Connecting…` and disabled                      |
|                               | HashPack wallet window appears<br/>Accounts A and B are available for selection |
| Wait for timeout              | `Connection to HashPack failed`<br/>`HashPack wallet is silent`                 |
| `Close`                       |                                                                                 |
|                               |                                                                                 |
| `Connect Wallet` > `Metamask` | `Connect Wallet` button renamed `Connecting…` and disabled                      |
|                               | Metamask wallet window appears<br/>Accounts A and B are available for selection |
| Wait for timeout              | `Connection to Metamask failed`<br/>`Metamask wallet is silent`                 |
| `Close`                       |                                                                                 |
|                               |                                                                                 |
| `Connect Wallet` > `Coinbase` | `Connect Wallet` button renamed `Connecting…` and disabled                      |
|                               | Coinbase wallet window appears<br/>Accounts A and B are available for selection |
| Wait for timeout              | `Connection to Coinbase failed`<br/>`Metamask wallet is silent`                 |
| `Close`                       |                                                                                 |


### 2. Connect / Cancel

| Action                           | Check                                                                                           |
|----------------------------------|-------------------------------------------------------------------------------------------------|
| `Connect Wallet` > `Blade`       | `Connect Wallet` button renamed `Connecting…` and disabled                                      |
|                                  | Blade wallet window appears<br/>Accounts A and B are available for selection                    |
| `Reject` _// In Blade window_    | Connection flow aborts silently<br/>`Connecting…`button is renamed `Connect Wallet` and enabled |
|                                  |                                                                                                 |
| `Connect Wallet` > `HashPack`    | `Connect Wallet` button renamed `Connecting…` and disabled                                      |
|                                  | HashPack wallet window appears<br/>Accounts A and B are available for selection                 |
| `Cancel` _// In HashPack window_ | Connection flow aborts silently<br/>`Connecting…`button is renamed `Connect Wallet' and enabled |
|                                  |                                                                                                 |
| `Connect Wallet` > `Metamask`    | `Connect Wallet` button renamed `Connecting…` and disabled                                      |
|                                  | Metamask wallet window appears<br/>Accounts A and B are available for selection                 |
| `Cancel` _// In Metamask window_ | Connection flow aborts silently<br/>`Connecting…`button is renamed `Connect Wallet' and enabled |
|                                  |                                                                                                 |
| `Connect Wallet` > `Coinbase`    | `Connect Wallet` button renamed `Connecting…` and disabled                                      |
|                                  | Coinbase wallet window appears<br/>Accounts A and B are available for selection                 |
| `Cancel` _// In Coinbase window_ | Connection flow aborts silently<br/>`Connecting…`button is renamed `Connect Wallet' and enabled |


### 3. Connect / Disconnect

| Action                           | Check                                                                                           |
|----------------------------------|-------------------------------------------------------------------------------------------------|
| `Connect Wallet` > `Blade`       | `Connect Wallet` button renamed `Connecting…` and disabled                                      |
|                                  | Blade wallet window appears<br/>Accounts A and B are available for selection                    |
| `Accept` _// In Blade window_    | `Connecting…` button replaced by `pulldown` with wallet icon and account id                     |
| `Disconnect`                     | `pulldown` replaced by `Connect Wallet` button                                                  |
|                                  |                                                                                                 |
| `Connect Wallet` > `HashPack`    | `Connect Wallet` button renamed `Connecting…` and disabled                                      |
|                                  | HashPack wallet window appears<br/>Accounts A and B are available for selection                 |
| `Accept` _// In HashPack window_ | `Connecting…` button replaced by `pulldown` with wallet icon and account id                     |
| `Disconnect`                     | `pulldown` replaced by `Connect Wallet` button                                                  |
|                                  |                                                                                                 |
| `Connect Wallet` > `Metamask`    | `Connect Wallet` button renamed `Connecting…` and disabled                                      |
|                                  | Metamask wallet window appears<br/>Accounts A and B are available for selection                 |
| `Accept` _// In Metamask window_ | `Connecting…` button replaced by `pulldown` with wallet icon and account id                     |
| `Disconnect`                     | `pulldown` replaced by `Connect Wallet` button                                                  |
|                                  |                                                                                                 |
| `Connect Wallet` > `Coinbase`    | `Connect Wallet` button renamed `Connecting…` and disabled                                      |
|                                  | Coinbase wallet window appears<br/>Accounts A and B are available for selection                 |
| `Accept` _// In Coinbase window_ | `Connecting…` button replaced by `pulldown` with wallet icon and account id                     |
| `Disconnect`                     | `pulldown` replaced by `Connect Wallet` button                                                  |


### 4. Change Staking + Stop Staking


### 5. Add Allowance + remove allowance

### 6. Import to {wallet}

### 7. Associate Token / Dissociate Token

