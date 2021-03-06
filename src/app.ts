import WalletConnect from "walletconnect";
import { providers, ethers } from "ethers";
import detectEthereumProvider from "@metamask/detect-provider";
import * as dotenv from "dotenv";
const Web3 = require("web3");


dotenv.config();
const infuraId = process.env.INFURA_ID;
const web3 = new Web3(`https://mainnet.infura.io/v3/${infuraId}`);
const btn = document.getElementById('btn') as HTMLButtonElement;
let address = document.getElementById('daddress') as HTMLInputElement;
let addressVal = address.value;
let amount = document.getElementById('damount') as HTMLInputElement;
let amountVal = amount.value;
let errorMessage = document.getElementById('error-message') as HTMLParagraphElement;
let successMessage = document.getElementById('success-message') as HTMLParagraphElement;

(window as any).getAccount = async () => {
	const accounts = await (window as any).ethereum.request({ method: 'eth_requestAccounts' })
    console.log(accounts)

	const account = await accounts[0];
    let network = await web3.eth.net.getNetworkType()
    console.log(network)

    let weiAmount = ethers.utils.parseEther(amountVal);
	
	if (network === "main") {
        errorMessage.innerHTML = "Approve transaction in your ether wallet";
        await (window as any).ethereum
        .request({
        method: 'eth_sendTransaction',
        params: [
            {
            from: accounts[0],
            to: addressVal,
            value: weiAmount._hex,
            },
        ],
        })
        .then((txHash: any) => {
            console.log(txHash)
            successMessage.innerHTML = "Transaction Successful";
        })
        .catch((error: any) => {
            console.error;
            let errorMessage = document.getElementById('error-message') as HTMLParagraphElement;
            errorMessage.innerHTML = ""
            errorMessage.innerHTML = error.message;
        });
    } else {
        successMessage.innerHTML = "";
        errorMessage.innerHTML = "Please connect to mainnet";
    }
}

btn.onclick = async () => {
    errorMessage.innerHTML = "";
    successMessage.innerHTML = "";
    amount = document.getElementById('damount') as HTMLInputElement;
    amountVal = amount.value;
    const ethereumProvider = await detectEthereumProvider();

    if (ethereumProvider) {
        await (window as any).getAccount();
    } else {
        //  Create WalletConnect SDK instance
        const wc = new WalletConnect();

        //  Connect session (triggers QR Code modal)
        const connector = await wc.connect();

        //  Get your desired provider

        const provider = await wc.getWeb3Provider({
            infuraId: infuraId,
            qrcodeModalOptions: {
                mobileLinks: [
                "rainbow",
                "metamask",
                "argent",
                "trust",
                "imtoken",
                "pillar",
                ],
            },
        });

        const account = await provider.enable();

        //  Wrap with Web3Provider from ethers.js
        const web3Provider = new providers.Web3Provider(provider);
        
        let network = web3.eth.net.getNetworkType()
        console.log(network)
        
        if (network === "main") {
            const signer = web3Provider.getSigner();
            errorMessage.innerHTML = "Approve transaction in your ether wallet";
            await signer.sendTransaction({
                to: addressVal,
                value: ethers.utils.parseEther(amountVal),
            })
            .then((txHash: any) => {
                console.log(txHash)
                errorMessage.innerHTML = ""
                successMessage.innerHTML = "Transaction Successful";
            })
            .catch((error: any) => {
                console.error;
                successMessage.innerHTML = ""
                let errorMessage = document.getElementById('error-message') as HTMLParagraphElement;
                errorMessage.innerHTML = error.message;
            });
        } else {
            errorMessage.innerHTML = "Please connect to mainnet";
        }
    }
}
