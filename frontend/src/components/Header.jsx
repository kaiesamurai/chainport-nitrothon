import { Container } from '@/components/Container'
import { Logo } from '@/components/Logo'
import React from 'react';
import { FaPowerOff } from 'react-icons/fa';


const Header = ({isConnected, account, selectedNetwork, handleNetworkChange, connect, disconnect}) => {
  return (
    <header>
      <nav>
        <Container className="relative z-50 flex justify-between py-8">
          <div className="relative z-10 flex items-center">
            <Logo className="h-10 w-auto" />
            <h1 className="font-display font-bold text-xl">ChainFlow</h1>
          </div>
          <div className="flex items-center gap-6">
            {isConnected ? (
              <>
                <label>
                  <select
                    class="block appearance-none bg-white border border-gray-400 hover:border-gray-500 px-4 py-2 pr-8 rounded shadow leading-tight focus:outline-none focus:shadow-outline"
                    value={selectedNetwork} onChange={handleNetworkChange}>
                    <option value="Mumbai">Mumbai</option>
                    <option value="Fuji">Fuji</option>
                  </select>
                </label>
                <button className="hidden lg:block bg-black hover:bg-gray-900 text-white font-bold py-2 px-4 rounded-md" onClick={disconnect}>
                  {account.slice(0, 6) + '...' + account.slice(-4)} <FaPowerOff className="inline-block ml-3 " />
                </button>
              </>
            ) : (
              <button class="bg-black hover:bg-gray-900 text-white font-bold py-2 px-4 rounded" onClick={connect}>
                Connect Wallet
              </button>
            )}
          </div>
        </Container>

      </nav>
    </header>
  )
}

export default Header;
