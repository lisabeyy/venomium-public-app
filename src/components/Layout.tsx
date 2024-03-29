import React, { Fragment, useState, useEffect } from 'react'
import { Dialog, Menu, Transition } from '@headlessui/react'
import {
  Bars3Icon,
  BellIcon,
  UserCircleIcon,
  StarIcon,
  Cog6ToothIcon,
  FolderIcon,
  WalletIcon,
  HomeIcon,
  UsersIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline'
import { ChevronDownIcon, MagnifyingGlassIcon } from '@heroicons/react/20/solid'
import { BrowserRouter as Router, Route, Routes, Navigate, useParams, Link, useLocation } from 'react-router-dom';
import { initVenomConnect } from '../lib/venom';
import Image from 'next/image';
import Logo from '../assets/venomium_3.svg';
import ConnectedIcon from '../assets/connected.svg';
import VenomConnect from 'venom-connect';
import ConnectWallet from './connectWallet';
import SearchAccount from './searchAccount';
import WatchlistService from '../lib/watchlist.api';
import Wallet from './WalletPage';
import Watchlist from './WatchlistPage';
import Footer from './Footer';

const navigation = [
  { name: 'My Wallet', href: '/wallet', icon: HomeIcon, current: true },
  { name: 'My Watchlist', href: '/watchlist', openWatchlist: true, icon: StarIcon, current: false },
]

const teams = [
  { id: 1, name: 'Top Tokens', href: '#', icon: WalletIcon, current: false },
  { id: 2, name: 'Top Traders', href: '#', icon: UsersIcon, current: false },
  { id: 3, name: 'Top LP', href: '#', icon: FolderIcon, current: false },
]


function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}


function Layout() {



  const params = useParams();
  const [searchAddress, setSearchAddress] = useState<string>('');
  const [venomProvider, setVenomProvider] = useState<any>();
  const [address, setAddress] = useState<string>('');
  const [userAddress, setUserAddress] = useState<string>('');
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [venomConnect, setVenomConnect] = useState<VenomConnect | undefined>();
  const [currentURL, setCurrentURL] = useState<string>('');
  const pathname = window.location.pathname;


  const init = async () => {
    const _venomConnect = await initVenomConnect();
    setVenomConnect(_venomConnect);
  };
  useEffect(() => {
  
    if (params && params.address) {
      setSearchAddress(params.address);
      setAddress(params.address);
    } else {
      setAddress(userAddress || '');
      setSearchAddress(userAddress || '');
    }
    init();
  }, []);



  // This method allows us to gen a wallet address from inpage provider
  const getAddress = async (provider: any) => {
    const providerState = await provider?.getProviderState?.();
    return providerState?.permissions.accountInteraction?.address.toString();
  };
  // Any interaction with venom-wallet (address fetching is included) needs to be authentificated
  const checkAuth = async (_venomConnect: any) => {
    const auth = await _venomConnect?.checkAuth();
    if (auth) await getAddress(_venomConnect);
  };
  // This handler will be called after venomConnect.login() action
  // connect method returns provider to interact with wallet, so we just store it in state
  const onConnect = async (provider: any) => {
    setVenomProvider(provider);
    await onProviderReady(provider);
  };
  // This handler will be called after venomConnect.disconnect() action

  const onDisconnect = async () => {
    venomProvider?.disconnect();
    setAddress('');
    setUserAddress('');
  };

  const handleResultClick = (address: string) => {
    setAddress('0:' + address);
  }






  // When our provider is ready, we need to get address and balance from.
  const onProviderReady = async (provider: any) => {
    const venomWalletAddress = provider ? await getAddress(provider) : undefined;
    setAddress(searchAddress ? searchAddress : venomWalletAddress);
    setUserAddress(venomWalletAddress);

  };
  useEffect(() => {
    // connect event handler
    const off = venomConnect?.on('connect', onConnect);
    if (venomConnect) {
      checkAuth(venomConnect);
    }
    // just an empty callback, cuz we don't need it
    return () => {
      off?.();
    };
  }, [venomConnect]);


  return (


    <Router>
      <div className='h-full'>

        <Transition.Root show={sidebarOpen} as={Fragment}>
          <Dialog as="div" className="relative z-50 lg:hidden" onClose={setSidebarOpen}>
            <Transition.Child
              as={Fragment}
              enter="transition-opacity ease-linear duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="transition-opacity ease-linear duration-300"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="fixed inset-0 bg-gray-900/80" />
            </Transition.Child>

            <div className="fixed inset-0 flex">
              <Transition.Child
                as={Fragment}
                enter="transition ease-in-out duration-300 transform"
                enterFrom="-translate-x-full"
                enterTo="translate-x-0"
                leave="transition ease-in-out duration-300 transform"
                leaveFrom="translate-x-0"
                leaveTo="-translate-x-full"
              >
                <Dialog.Panel className="relative mr-16 flex w-full max-w-xs flex-1">
                  <Transition.Child
                    as={Fragment}
                    enter="ease-in-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in-out duration-300"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                  >
                    <div className="absolute left-full top-0 flex w-16 justify-center pt-5">
                      <button type="button" className="-m-2.5 p-2.5" onClick={() => setSidebarOpen(false)}>
                        <span className="sr-only">Close sidebar</span>
                        <XMarkIcon className="h-6 w-6 text-white" aria-hidden="true" />
                      </button>
                    </div>
                  </Transition.Child>
                  {/* Sidebar component, swap this element with another sidebar if you like */}
                  <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-gray-900 px-6 pb-4 ring-1 ring-white/10">
                    <div className="flex h-16 shrink-0 items-center">
                      <Image src={Logo} width={100} alt="logo " /> <span className='text-white text-bold'>Testnet</span>
                    </div>
                    <nav className="flex flex-1 flex-col">
                      <ul role="list" className="flex flex-1 flex-col gap-y-7">
                        <li>
                          <ul role="list" className="-mx-2 space-y-1">
                            {navigation.map((item) => (
                              <li key={item.name}>
                                <Link
                                  onClick={() => setCurrentURL(item.href)}
                                  to={item.href}
                                  className={classNames(
                                    pathname.includes(item.href) || currentURL == item.href
                                      ? 'bg-gray-800 text-[#05ED9F]'
                                      : 'text-gray-400 hover:text-white hover:bg-gray-800',
                                    'group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold'
                                  )}
                                >
                                  <item.icon className="h-6 w-6 shrink-0" aria-hidden="true" />
                                  {item.name} 
                                </Link>



                              </li>
                            ))}
                          </ul>
                        </li>
                        <li>
                          <div className="text-xs font-semibold leading-6 text-gray-400">More tools</div>
                          <ul role="list" className="-mx-2 mt-2 space-y-1">
                            {teams.map((team) => (
                              <li key={team.name}>
                                <a
                                  href={team.href}
                                  className={classNames(
                                    team.current
                                      ? 'bg-gray-800 text-white'
                                      : 'text-gray-400 hover:text-white hover:bg-gray-800',
                                    'group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold'
                                  )}
                                >
                                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border border-gray-700 bg-gray-800 text-[0.625rem] font-medium text-gray-400 group-hover:text-white">
                                    <team.icon />
                                  </span>
                                  <span className="truncate">{team.name}</span>
                                </a>
                              </li>
                            ))}
                          </ul>
                        </li>
                      
                      </ul>
                      <Footer />
                    </nav>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </Dialog>
        </Transition.Root>

        {/* Static sidebar for desktop */}
        <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
          {/* Sidebar component, swap this element with another sidebar if you like */}
          <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-gray-900 px-6 pb-4">
            <div className="flex h-16 shrink-0 items-center">
              { /* logo venom */}
              <Image src={Logo} width={100} alt="logo " /><span className='text-white text-xs font-bold '>Testnet</span>


            </div>
            <nav className="flex flex-1 flex-col">
              <ul role="list" className="flex flex-1 flex-col gap-y-7">
                <li>
                  <ul role="list" className="-mx-2 space-y-1">
                    {navigation.map((item) => (
                      <li key={item.name}>

                        <Link

                          onClick={() => setCurrentURL(item.href)}
                          to={item.href}
                          className={classNames(
                            pathname.includes(item.href) || currentURL == item.href
                              ? 'bg-gray-800 text-white'
                              : 'text-gray-400 hover:text-white hover:bg-gray-800',
                            'group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold'
                          )}
                        >
                          <item.icon className="h-6 w-6 shrink-0" aria-hidden="true" />
                          {item.name} 
                        </Link>



                      </li>
                    ))}
                  </ul>
                </li>
                <li>
                  <div className="text-xs font-semibold leading-6 text-gray-400">More links</div>
                  <ul role="list" className="-mx-2 mt-2 space-y-1">
                    {teams.map((team) => (
                      <li key={team.name}>
                        <a
                          href={team.href}
                          className={classNames(
                            team.current
                              ? 'bg-gray-800 text-white'
                              : 'text-gray-400 hover:text-white hover:bg-gray-800',
                            'group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold'
                          )}
                        >
                          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border border-gray-700 bg-gray-800 text-[0.625rem] font-medium text-gray-400 group-hover:text-white">
                            <team.icon />
                          </span>
                          <span className="truncate">{team.name}</span>
                        </a>
                      </li>
                    ))}
                  </ul>
                </li>
               
              </ul>

              <Footer />
            </nav>
          </div>
        </div>

        <div className="lg:pl-72 h-full">
          <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
            <button type="button" className="-m-2.5 p-2.5 text-gray-700 lg:hidden" onClick={() => setSidebarOpen(true)}>
              <span className="sr-only">Open sidebar</span>
              <Bars3Icon className="h-6 w-6" aria-hidden="true" />
            </button>

            {/* Separator */}
            <div className="h-6 w-px bg-gray-900/10 lg:hidden" aria-hidden="true" />

            <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
              <div className="relative flex flex-1">
                <SearchAccount onResultClick={handleResultClick} address={searchAddress ? searchAddress : address} />
              </div>
              <div className="flex items-center gap-x-4 lg:gap-x-6">
                <button type="button" className="-m-2.5 p-2.5 text-gray-400 hover:text-gray-500">
                  <span className="sr-only">View notifications</span>
                  <BellIcon className="h-6 w-6" aria-hidden="true" />
                </button>

                {/* Separator */}
                <div className="hidden lg:block lg:h-6 lg:w-px lg:bg-gray-900/10" aria-hidden="true" />

                {/* Profile dropdown */}

                {userAddress && (
                  <>

                    <Menu as="div" className="relative">
                      <Menu.Button className="-m-1.5 flex items-center p-1.5">
                        <span className="sr-only">Open user menu</span>
                        <Image src={ConnectedIcon} width={20} alt="logo " />


                        <span className="hidden lg:flex lg:items-center">
                          <span className="ml-4 text-sm font-semibold leading-6 text-gray-900" aria-hidden="true">
                            {userAddress.slice(0, 6)}...{userAddress.slice(-4)}
                          </span>
                          <ChevronDownIcon className="ml-2 h-5 w-5 text-gray-400" aria-hidden="true" />
                        </span>
                      </Menu.Button>
                      <Transition
                        as={Fragment}
                        enter="transition ease-out duration-100"
                        enterFrom="transform opacity-0 scale-95"
                        enterTo="transform opacity-100 scale-100"
                        leave="transition ease-in duration-75"
                        leaveFrom="transform opacity-100 scale-100"
                        leaveTo="transform opacity-0 scale-95"
                      >
                        <Menu.Items className="absolute right-0 z-10 mt-2.5 w-32 origin-top-right rounded-md bg-white py-2 shadow-lg ring-1 ring-gray-900/5 focus:outline-none">
                          <a
                            onClick={onDisconnect}
                            href='#'
                            className='block px-3 py-1 text-sm leading-6 text-gray-900'
                          >
                            Log out
                          </a>
                        </Menu.Items>
                      </Transition>
                    </Menu>

                  </>

                )}

              </div>
            </div>


            {!userAddress && (
              <ConnectWallet venomConnect={venomConnect} />
            )}


          </div>

          <Routes>
            <Route path='/' element={<Navigate to='/wallet/' />} />
            <Route path="/wallet/:address?" element={<Wallet userAddress={userAddress} address={address} />} />
            <Route path="/watchlist" element={<Watchlist addressRedirect={address} userAddress={userAddress} />} />
          </Routes>



        </div>
      </div>
    </Router>


  );
}

export default Layout;