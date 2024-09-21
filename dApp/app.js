// Global Variables
let provider, signer, userAccount;

// Connect to MetaMask Wallet
async function connectWallet() {
  if (typeof window.ethereum !== 'undefined') {
    try {
      provider = new ethers.providers.Web3Provider(window.ethereum);
      await provider.send('eth_requestAccounts', []);
      signer = provider.getSigner();
      userAccount = await signer.getAddress();

      const balance = await provider.getBalance(userAccount);
      const ethBalance = ethers.utils.formatEther(balance); // Convert balance to Ether

      document.getElementById('walletAddress').innerText = `Connected: ${userAccount} (Balance: ${ethBalance} ETH)`;
      document.getElementById('gratitudeFormSection').classList.remove('hidden'); // Show form after connection
      console.log('Connected to account:', userAccount);
    } catch (error) {
      console.error('Error connecting to MetaMask:', error);
    }
  } else {
    alert('MetaMask is not installed!');
  }
}

// Function to send Ether and post note
async function postGratitudeNote(recipient, message, recipientWallet) {
  // Show the Ether input modal
  document.getElementById('etherModal').classList.remove('hidden');

  // Handle the form submission
  document.getElementById('submitEther').onclick = async () => {
    const amountToSend = document.getElementById('etherAmount').value;

    if (amountToSend > 0) {
      try {
        // Get user's current balance
        const balance = await provider.getBalance(userAccount);
        const ethBalance = ethers.utils.formatEther(balance); // Convert balance to Ether

        if (parseFloat(amountToSend) > parseFloat(ethBalance)) {
          // If balance is insufficient, show modal
          document.getElementById('balanceMessage').innerText = `Your current balance is ${ethBalance} ETH, which is insufficient to send ${amountToSend} ETH.`;
          document.getElementById('insufficientBalanceModal').classList.remove('hidden');
          return; // Stop the transaction from proceeding
        }

        // Hide the modal and show the loader
        document.getElementById('etherModal').classList.add('hidden');
        showLoader();

        // Send Ether to the recipient's wallet address
        const tx = await signer.sendTransaction({
          to: recipientWallet,  // Send Ether to the recipient's wallet address
          value: ethers.utils.parseEther(amountToSend)  // Amount in Ether
        });

        // Wait for the transaction to be confirmed
        await tx.wait();

        // Hide the loader and show success modal with transaction hash
        hideLoader();
        showSuccessModal(recipient, message, amountToSend, tx.hash); // Pass tx.hash here
      } catch (error) {
        hideLoader();
        showFailedModal();
        console.error('Error sending Ether:', error);
      }
    } else {
      alert('Please enter a valid amount of Ether.');
    }
  };

  document.getElementById('cancelEther').onclick = () => {
    document.getElementById('etherModal').classList.add('hidden');
  };
}

// Display loader
function showLoader() {
  document.getElementById('loader').classList.remove('hidden');
}

// Hide loader
function hideLoader() {
  document.getElementById('loader').classList.add('hidden');
}

// Show success modal with transaction hash and Etherscan link
function showSuccessModal(recipient, message, amount, txHash) {
  const modal = document.getElementById('successModal');
  modal.classList.remove('hidden');
  document.getElementById('modalTitle').innerText = 'Transaction Successful!';
  document.getElementById('modalMessage').innerText = `Message: ${message}`;
  document.getElementById('modalAmount').innerText = `Amount: ${amount} ETH sent to ${recipient}`;
  const txLink = document.getElementById('txLink');
  txLink.href = `https://sepolia.etherscan.io/tx/${txHash}`;  // Link to Etherscan
  txLink.innerText = txHash;

  // Automatically close the modal after 30 seconds
  setTimeout(() => {
    modal.classList.add('hidden');
  }, 30000);
}

// Show transaction failed modal
function showFailedModal() {
  const modal = document.getElementById('failedModal');
  modal.classList.remove('hidden');
  setTimeout(() => {
    modal.classList.add('hidden');
  }, 6000);
}

// Close Success Modal Manually
document.getElementById('closeSuccessModal').onclick = () => {
  document.getElementById('successModal').classList.add('hidden');
};

// Close Insufficient Balance Modal Manually
document.getElementById('closeInsufficientBalanceModal').onclick = () => {
  document.getElementById('insufficientBalanceModal').classList.add('hidden');
};

// Form Submit
document.getElementById('gratitudeForm').addEventListener('submit', async function(event) {
  event.preventDefault();
  const recipient = document.getElementById('recipient').value;
  const message = document.getElementById('message').value;
  const recipientWallet = document.getElementById('recipientWallet').value;

  // Send Ether to the recipient's wallet
  await postGratitudeNote(recipient, message, recipientWallet);

  // Reset the form
  document.getElementById('gratitudeForm').reset();
});

// Connect Wallet Button
document.getElementById('connectWallet').addEventListener('click', connectWallet);
