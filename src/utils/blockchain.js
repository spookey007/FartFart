import { ethers } from "ethers";

export const getBalance = async (address) => {
  if (!window.ethereum) return "Install MetaMask!";
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const balance = await provider.getBalance(address);
  return ethers.utils.formatEther(balance);
};
