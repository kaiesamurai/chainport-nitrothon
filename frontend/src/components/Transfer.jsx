import { useState } from 'react';
import { Container } from '@/components/Container';
import { FaPlus, FaMinus } from 'react-icons/fa';
import { ethers } from 'ethers';

const Transfer = ({ isConnected, contract, account, accountBalance, setAccountBalance }) => {

    const isTransferDisabled = !isConnected && accountBalance === '0';
    const [transfers, setTransfers] = useState([{ destChainId: '', recipients: [], amounts: [] }]);
    const [isTransferSuccessModalOpen, setTransferSuccessModalOpen] = useState(false);

    const handleChainIdChange = (index, value) => {
        const updatedTransfers = [...transfers];
        updatedTransfers[index].destChainId = value;
        setTransfers(updatedTransfers);
    };

    const handleRecipientChange = (index, value) => {
        const updatedTransfers = [...transfers];
        updatedTransfers[index].recipients = value.split(',');
        setTransfers(updatedTransfers);
    };

    const handleAmountChange = (index, value) => {
        const updatedTransfers = [...transfers];
        updatedTransfers[index].amounts = value.split(',').map(Number);
        setTransfers(updatedTransfers);
    };

    // const handleAmountChange = (index, value) => {
    //     const updatedTransfers = [...transfers];
    //     const amountsInEther = value.split(',').map(parseFloat);
    //     const amountsInWei = amountsInEther.map((amount) =>
    //         ethers.utils.parseEther(amount.toString())
    //     );
    //     updatedTransfers[index].amounts = amountsInWei;
    //     setTransfers(updatedTransfers);
    // };

    const handleAddOrRemoveTransfer = (index) => {
        const updatedTransfers = [...transfers];

        if (index === transfers.length - 1) {
            updatedTransfers.push({ destChainId: '', recipients: [], amounts: [] });
        } else {
            updatedTransfers.splice(index, 1);
        }

        setTransfers(updatedTransfers);
    };

    const formatEther = (value) => {
        if (!value) return '0.00';
        return parseFloat(ethers.utils.formatEther(value)).toFixed(3);
    };

    const handleMintTokens = async () => {
        try {
            if (!contract) {
                console.error('Contract not loaded');
                return;
            }

            if (!ethers.utils.isAddress(account)) {
                console.error('Invalid account address');
                return;
            }

            const mintingAmountInWei = ethers.utils.parseEther('500');
            const tx = await contract.mint(account, mintingAmountInWei);
            await tx.wait();
            console.log('Tokens minted successfully!');
            setAccountBalance(mintingAmountInWei.toString());
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const handleTransfer = async () => {
        try {
            if (!contract) {
                console.error('Contract not loaded');
                return;
            }

            const filteredTransfers = transfers.filter((transfer) => {
                return (
                    transfer.destChainId !== '' &&
                    transfer.recipients.length > 0 &&
                    transfer.amounts.length > 0 &&
                    transfer.recipients.length === transfer.amounts.length
                );
            });

            if (filteredTransfers.length === 0) {
                console.error('Invalid transfer details');
                return;
            }

            const metadata = "0x000000000007a12000000006fc23ac0000000000000000000000000000000000000000000000000000000000000000000000";
            const tx = await contract.transferBulkCrossChain(filteredTransfers, metadata);
            await tx.wait();
            console.log('Transfers successful!');
            setTransferSuccessModalOpen(true);
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const closeModal = () => {
        setTransferSuccessModalOpen(false);
    };


    return (
        <section
            id="secondary-features"
            aria-label="Features for building a portfolio"
            className="py-20 sm:py-32"
        >
            <Container>
                <div className="mx-auto max-w-3xl sm:text-center">
                    <h2 className="text-3xl font-medium tracking-tight text-gray-900">
                        One-click fund transfer across multiple chains!
                    </h2>
                </div>
                <div>
                    <div className="flex gap-4 mt-10">
                        <h1 className="text-lg">Account Balance: {formatEther(accountBalance)}</h1>
                        <button
                            className="bg-cyan-600 hover:bg-cyan-900 text-white font-bold py-2 px-4 rounded"
                            onClick={handleMintTokens}
                            disabled={!isConnected || !contract}
                        >
                            Mint Test Tokens
                        </button>
                    </div>
                    {transfers.map((transfer, index) => (
                        <div key={index}>
                            <h2 className="mt-10 mb-5 text-xl font-medium ">Transfer {index + 1}</h2>
                            <div class="flex flex-wrap -mx-3 mb-2">
                                <div class="w-full md:w-1/3 px-3 mb-6 md:mb-0">
                                    <label class="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2" for="grid-city">
                                        Recipients
                                    </label>
                                    <input
                                        type="text"
                                        value={transfer.recipients.join(',')}
                                        onChange={(e) => handleRecipientChange(index, e.target.value)}
                                        placeholder='0x0...000,0x0...000,0x0...000'
                                        className="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                                        disabled={isTransferDisabled}
                                    />
                                </div>
                                <div class="w-full md:w-1/3 px-3 mb-6 md:mb-0">
                                    <label class="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2" for="grid-state">
                                        Destination Chain
                                    </label>
                                    <div class="relative">
                                        <select
                                            class="block appearance-none w-full bg-gray-200 border border-gray-200 text-gray-700 py-3 px-4 pr-8 rounded leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                                            value={transfer.destChainId}
                                            onChange={(e) => handleChainIdChange(index, e.target.value)}
                                            disabled={isTransferDisabled}
                                        >
                                            <option value="">Select Chain</option>
                                            <option value="80001">Polygon Mumbai</option>
                                            <option value="43113">Avalanche Fuji</option>
                                        </select>
                                    </div>

                                </div>
                                <div class="w-full md:w-1/3 px-3 mb-6 md:mb-0">
                                    <label class="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2" for="grid-zip">
                                        Amount
                                    </label>
                                    <input
                                        type="text"
                                        value={transfer.amounts.join(',')}
                                        placeholder='100,200,300'
                                        onChange={(e) => handleAmountChange(index, e.target.value)}
                                        className="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                                        disabled={isTransferDisabled}
                                    />
                                </div>
                            </div>
                            {index === transfers.length - 1 ? (
                                <button onClick={() => handleAddOrRemoveTransfer(index)}><FaPlus className="inline-block mr-1" /></button>
                            ) : (
                                <button onClick={() => handleAddOrRemoveTransfer(index)}><FaMinus className="inline-block mr-1" /></button>
                            )}
                        </div>
                    ))}
                    <br />
                    <button
                        className="bg-cyan-600 hover:bg-cyan-900 text-white font-bold py-2 px-4 rounded"
                        onClick={handleTransfer}
                        disabled={isTransferDisabled}>
                        Transfer
                    </button>
                </div>
                {isTransferSuccessModalOpen && (
                    <div className="fixed inset-0 flex items-center justify-center z-10">
                        <div className="bg-black text-white p-8 rounded shadow-lg">
                            <h2 className="text-2xl font-medium mb-4">Transfer Successful!</h2>
                            <p>Your funds were transferred successfully.</p>
                            <div className="mt-4">
                                <button
                                    className="bg-cyan-600 hover:bg-cyan-900 text-white font-bold py-2 px-4 rounded "
                                    onClick={closeModal}
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </Container>
        </section>
    )
}

export default Transfer;