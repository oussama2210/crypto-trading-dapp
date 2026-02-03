// lib/walletkit.js
import { Core } from "@walletconnect/core";
import { WalletKit } from "@reown/walletkit";
import {
    buildApprovedNamespaces,
    getSdkError,
    populateAuthPayload,
    buildAuthObject
} from "@walletconnect/utils";

const core = new Core({
    projectId: process.env.PROJECT_ID,
});

const walletKit = await WalletKit.init({
    core,
    metadata: {
        name: "Demo Wallet",
        description: "Demo Client as Wallet/Peer",
        url: "https://reown.com/walletkit",
        icons: [],
    },
});

async function yourSigningFunction(params: any) {
    // This is a placeholder. In a real app, you would use a private key to sign the data.
    console.log("Signing data:", params);
    return "0xmock_signature";
}


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
        await walletKit.rejectSession({ id, reason: getSdkError("USER_REJECTED") });
    }
});

// Handle One-Click Auth (SIWE authentication)
walletKit.on("session_authenticate", async (payload) => {
    const supportedChains = ["eip155:1", "eip155:137"];
    const supportedMethods = ["personal_sign", "eth_sendTransaction"];

    const authPayload = populateAuthPayload({
        authPayload: payload.params.authPayload,
        chains: supportedChains,
        methods: supportedMethods,
    });

    const iss = `eip155:1:0xYourWalletAddress`;
    const message = walletKit.formatAuthMessage({ request: authPayload, iss });

    // Sign the message with your wallet
    const signature = await yourSigningFunction(message);

    const auth = buildAuthObject(
        authPayload,
        { t: "eip191", s: signature },
        iss
    );

    await walletKit.approveSessionAuthenticate({
        id: payload.id,
        auths: [auth],
    });
});

// Handle session requests
walletKit.on("session_request", async (event) => {
    const { topic, params, id } = event;
    const signedMessage = await yourSigningFunction(params.request.params);

    await walletKit.respondSessionRequest({
        topic,
        response: { id, result: signedMessage, jsonrpc: "2.0" },
    });
});

// Pair with dapp
export async function pair(uri: string) {
    await walletKit.pair({ uri });
}

export { walletKit };