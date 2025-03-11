// SPDX-License-Identifier: Apache-2.0

import {RouteManager} from "@/utils/RouteManager";
import {WalletManagerV4} from "@/utils/wallet/WalletManagerV4.ts";

export const routeManager = new RouteManager()
export const walletManager = new WalletManagerV4(routeManager)

const router = routeManager.router
export default router
