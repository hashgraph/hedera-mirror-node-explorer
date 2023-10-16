<!--
  -
  - Hedera Mirror Node Explorer
  -
  - Copyright (C) 2021 - 2023 Hedera Hashgraph, LLC
  -
  - Licensed under the Apache License, Version 2.0 (the "License");
  - you may not use this file except in compliance with the License.
  - You may obtain a copy of the License at
  -
  -      http://www.apache.org/licenses/LICENSE-2.0
  -
  - Unless required by applicable law or agreed to in writing, software
  - distributed under the License is distributed on an "AS IS" BASIS,
  - WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  - See the License for the specific language governing permissions and
  - limitations under the License.
  -
  -->

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                     TEMPLATE                                                    -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<template>
    <div v-if="connected && showWalletInfo" :class="{'box': !isTouchDevice && isSmallScreen, 'h-box-border': !isTouchDevice && isSmallScreen}" 
                style="position: absolute; display: flex; flex-direction: column; gap: 1rem; width: 380px; top: 45px; right: 0; z-index: 10; border: 1px solid white; padding: 16px 12px;">
          <!-- header -->
          <div style="display: flex; gap: 1rem">
            <!-- logo icon -->
            <figure style="width: 50px; height: 50px; display: flex; align-items: center;">
                <img :src="walletIconURL ?? undefined" alt="wallet logo" style="object-fit: contain; aspect-ratio: 3/2;display: flex; height: 90%;">
            </figure>

            <!-- accountID-checksum -->
            <div class="is-flex is-align-items-center" style="gap: 0.5rem; font-size: 1.35rem;">
                <p>
                  <!-- {{ accountId }} -->
                  <router-link v-if="accountRoute" :to="accountRoute">
                    <span class="is-numeric">{{ accountId }}</span>
                  </router-link>
                  <span class="has-text-grey h-is-smaller">-{{ accountChecksum }}</span>
                </p>
                <i v-if="!contentCopied.accountId.status" class="fa fa-thin fa-clone fa-rotate-180" style="font-size: 0.9rem; cursor:pointer;" @click="copyToClipboard(accountId, contentCopied.accountId.mode)"/>
                <i v-else class="fa fa-thin fa-check" style="font-size: 0.9rem;"/>
            </div>
          </div>

          <!-- EVM address -->
          <div class="p-2" style="border: 1px solid white;">
            <p class="has-text-grey h-is-smaller">EVM ADDRESS</p>

            <div class="is-flex is-align-items-center" style="gap: 0.5rem">
              <p>
                <router-link v-if="accountRoute" :to="accountRoute">
                  {{ accountEthereumAddress?.slice(0, 18) }}...{{ accountEthereumAddress?.slice(-8)}}
                </router-link>
              </p>
              <i v-if="!contentCopied.evmAddress.status" class="fa fa-thin fa-clone fa-rotate-180" style="font-size: 0.9rem; cursor:pointer;" @click="copyToClipboard(accountEthereumAddress, contentCopied.evmAddress.mode)"/>
              <i v-else class="fa fa-thin fa-check" style="font-size: 0.9rem;"/>

            </div>
          </div>

          <!-- balance -->
          <div class="p-2" style="border: 1px solid white;">
            <p class="has-text-grey h-is-smaller">BALANCE</p>
            <p class="has-text-white" style="font-size: 1.2rem">{{ formattedAmount }} ℏ</p>

            <span>
              <HbarExtra :hide-zero="false" :small-extra="false" :tbar-amount="tbarBalance ?? 0"/>
            </span>
          </div>

          <!-- Footer -->
          <div class="is-flex is-justify-content-space-between">
            <button class="button is-white is-small" style="outline: none; height: 40px">
              CHANGE ACCOUNT
            </button>

            <button @click="disconnectFromWallet" class="button is-white is-small" style="outline: none; height: 40px">
              DISCONNECT WALLET
            </button>
          </div>
        </div>
</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script lang="ts">
import {routeManager, walletManager} from "@/router";
import HbarExtra from "@/components/values/HbarExtra.vue";
import { AccountLocParser } from '@/utils/parser/AccountLocParser';
import { BalanceAnalyzer } from '@/utils/analyzer/BalanceAnalyzer';
import { computed, defineComponent, inject, onBeforeUnmount, onMounted, ref } from 'vue';



export default defineComponent({
    name: "WalletInfo",
    components: {HbarExtra},
    props: {
        connected: {
            type: Boolean,
            default: false,
        },
        showWalletInfo: {
            type: Boolean,
            default: false,
        },
        walletIconURL: {
            type: String,
            default: undefined,
        },
        accountId: {
            type: String,
            default: undefined,
        },
    },
    emit: ['walletDisconnect'],
    
    setup(props, ctx) {
        const isSmallScreen = inject('isSmallScreen', true)
        const isMediumScreen = inject('isMediumScreen', true)
        const isTouchDevice = inject('isTouchDevice', false)
        const contentCopied = ref({
          accountId: {
            mode: "ACCOUNT_ID",
            status: false,
          },
          evmAddress: {
            mode: "EVM_ADDRESS",
            status: false,
          },
        });

        //
        // Account
        //
        const accountLocParser = new AccountLocParser(walletManager.accountId)
        onMounted(() => accountLocParser.mount())
        onBeforeUnmount(() => accountLocParser.unmount())

        const accountRoute = computed(() => {
          return walletManager.accountId.value !== null
              ? routeManager.makeRouteToAccount(walletManager.accountId.value, false)
              : null
         })
        
        const accountEthereumAddress = accountLocParser.ethereumAddress

        // 
        // Balance
        // 
        const balanceAnalyzer = new BalanceAnalyzer(accountLocParser.accountId, 10000)
        onMounted(() => balanceAnalyzer.mount())
        onBeforeUnmount(() => balanceAnalyzer.unmount())

        const hbarBalance = computed(() => {
            return (balanceAnalyzer.hbarBalance.value ??0) / 100000000
        })

        const formattedAmount = computed(() => {
            const amountFormatter = new Intl.NumberFormat('en-US', {
                minimumFractionDigits: 0,
                maximumFractionDigits: 8
            })
            return amountFormatter.format(hbarBalance.value)
        })

        // 
        // disconnect from wallet
        // 
        const disconnectFromWallet = () => {
          ctx.emit('walletDisconnect', true)
        }

        // 
        // Copy content to clipboard
        //
        const copyToClipboard = (contentToCopy: any, mode: string): void => {
          navigator.clipboard.writeText(contentToCopy);
          switch (mode) {
            case "ACCOUNT_ID":
              contentCopied.value.accountId.status = true;
              break;
              
            case "EVM_ADDRESS":
              contentCopied.value.evmAddress.status = true;
              break;

            default:
              return
            }
            
            setTimeout(() => {
              contentCopied.value.accountId.status = false;
              contentCopied.value.evmAddress.status = false;
            }, 2000)
        }

        return {
            accountRoute,
            isTouchDevice,
            contentCopied,
            isSmallScreen,
            isMediumScreen,
            copyToClipboard,
            formattedAmount,
            disconnectFromWallet,
            tbarBalance: balanceAnalyzer.hbarBalance,
            accountChecksum: accountLocParser.accountChecksum,
            accountEthereumAddress,
        }
    },
})

</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                       STYLE                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style/>

