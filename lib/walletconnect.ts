// lib/walletkit.js
import { Core } from "@walletconnect/core";
import { WalletKit } from "@reown/walletkit";
import { buildApprovedNamespaces, getSdkError } from "@walletconnect/utils";

const core = new Core({
    projectId: process.env.PROJECT_ID,
});

const walletKit = await WalletKit.init({
    core,
    metadata: {
        name: "Demo app",
        description: "Demo Client as Wallet/Peer",
        url: "https://reown.com/walletkit",
        icons: [],
    },
});

// Handle session proposals
walletKit.on("session_proposal", async ({ id, params }) => {
    try {
        const approvedNamespaces = buildApprovedNamespaces({
            proposal: params,
            supportedNamespaces: {
                eip155: {
                    chains: ["eip155:1", "eip155:137"],
                    methods: ["eth_sendTransaction", "personal_sign"],
                    events: ["accountsChanged", "chainChanged"],
                    accounts: [
                        "eip155:1:0xYourWalletAddress",
                        "eip155:137:0xYourWalletAddress",
                    ],
                },
            },
        });

        await walletKit.approveSession({ id, namespaces: approvedNamespaces });
    } catch (error) {
        await walletKit.rejectSession({
            id,
            reason: getSdkError("USER_REJECTED"),
        });
    }
});

// Handle session requests (signing, transactions)
walletKit.on("session_request", async (event) => {
    const { topic, params, id } = event;
    const { request } = params;

    // Sign the message with your wallet logic
    const signedMessage = await yourSigningFunction(request.params);

    await walletKit.respondSessionRequest({
        topic,
        response: { id, result: signedMessage, jsonrpc: "2.0" },
    });
});

// Pair with dapp using URI from QR code
export async function pair(uri) {
    await walletKit.pair({ uri });
}

export { walletKit };