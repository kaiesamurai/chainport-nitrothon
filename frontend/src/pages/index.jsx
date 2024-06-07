import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import { ethers } from 'ethers';
import Hero from '@/components/Hero';
import Header from '@/components/Header';
import Transfer from '@/components/Transfer';
import Footer from '@/components/Footer';
import { BulkTransfer } from '@/utils/BulkTransfer';

const Home = () => {
  const [account, setAccount] = useState('');
  const [contract, setContract] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [selectedNetwork, setSelectedNetwork] = useState('');
  const [accountBalance, setAccountBalance] = useState('0');

  useEffect(() => {
    const isWalletConnected = localStorage.getItem('isWalletConnected') === 'true';
    if (isWalletConnected) {
      connect();
    }
  }, []);

  const connect = async () => {
    if (window.ethereum) {
      try {
        await window.ethereum.enable();
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const network = await provider.getNetwork();
        console.log("network", network);
        var selectedContractAddress;
        if (network.chainId === 80001) {
          selectedContractAddress = '0x7B263756dB168445FBf911381291e18Cd2dA2f04';
          setSelectedNetwork("Mumbai")
        } else if (network.chainId === 43113) {
          selectedContractAddress = '0x71DC940565abC6cAcA722dE8da5c00e72D4f9757';
          setSelectedNetwork("Fuji")
        } else {
          console.error('Unsupported network. Please connect to Mumbai or Fuji testnet.');
          alert('Please switch to the Mumbai or Fuji testnet.');
          return;
        }
        console.log("selectedContractAddress", selectedContractAddress)
        const contract = new ethers.Contract(selectedContractAddress, BulkTransfer, signer);
        setContract(contract);

        const accounts = await provider.listAccounts();
        const account = accounts[0];
        setAccount(account);
        setIsConnected(true);
        localStorage.setItem('isWalletConnected', 'true');
        const balance = await contract.balanceOf(account);
        setAccountBalance(balance.toString());
      } catch (error) {
        console.error(error);
      }
    } else {
      console.error('Metamask not found. Please install Metamask extension.');
    }
  };


  const handleNetworkChange = async (e) => {
    const networkName = e.target.value;
    setSelectedNetwork(networkName);
    if (networkName === 'Mumbai') {
      await switchNetwork(80001);
    } else if (networkName === 'Fuji') {
      await switchNetwork(43113);
    }
  };

  const switchNetwork = async (chainId) => {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${chainId.toString(16)}` }],
      });
    } catch (error) {
      console.error(error);
    }
    connect();
  };

  const disconnect = () => {
    console.log('Disconnected')
    setAccount('');
    setIsConnected(false);
    localStorage.setItem('isWalletConnected', 'false');
  };


  return (

    <div>
      <Head>
        <title>ChainFlow</title>
        <meta
          name="description"
          content="Cross Chain Fund Transfer Accelerator"
        />
      </Head>
      <Header
        isConnected={isConnected}
        account={account}
        selectedNetwork={selectedNetwork}
        handleNetworkChange={handleNetworkChange}
        connect={connect}
        disconnect={disconnect} />
      <Hero />
      <Transfer
        isConnected={isConnected}
        contract={contract}
        account={account}
        accountBalance={accountBalance}
        setAccountBalance={setAccountBalance} />
      <Footer />
    </div>
  )
}

export default Home;

