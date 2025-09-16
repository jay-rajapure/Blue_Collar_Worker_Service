document.addEventListener('DOMContentLoaded', function() {
    const availableBalanceSpan = document.getElementById('availableBalance');
    const escrowBalanceSpan = document.getElementById('escrowBalance');
    const totalBalanceSpan = document.getElementById('totalBalance');
    const transactionsList = document.getElementById('transactionsList');
    const depositBtn = document.getElementById('depositBtn');
    const transferBtn = document.getElementById('transferBtn');
    const userNameSpan = document.getElementById('userName');
    
    // Initialize page
    initializePage();
    
    // Initialize page
    async function initializePage() {
        try {
            // Set user name
            const userName = localStorage.getItem('userName') || sessionStorage.getItem('userName');
            if (userName) {
                userNameSpan.textContent = userName;
            }
            
            // Load wallet data
            await loadWalletData();
            await loadTransactions();
            
        } catch (error) {
            console.error('Error initializing page:', error);
        }
    }
    
    // Load wallet data
    async function loadWalletData() {
        try {
            const response = await fetch('/api/wallet', {
                method: 'GET',
                headers: {
                    'Authorization': 'Bearer ' + localStorage.getItem('token')
                }
            });
            
            if (response.ok) {
                const wallet = await response.json();
                updateBalanceDisplay(wallet);
            } else {
                const error = await response.json();
                console.error('Error loading wallet:', error.error);
            }
        } catch (error) {
            console.error('Error loading wallet:', error);
        }
    }
    
    // Update balance display
    function updateBalanceDisplay(wallet) {
        const available = wallet.balance || 0;
        const escrow = wallet.escrowBalance || 0;
        const total = available + escrow;
        
        availableBalanceSpan.textContent = available.toFixed(2);
        escrowBalanceSpan.textContent = escrow.toFixed(2);
        totalBalanceSpan.textContent = total.toFixed(2);
    }
    
    // Load transactions
    async function loadTransactions() {
        try {
            // For now, we'll simulate transactions
            // In a real implementation, this would fetch from the backend
            const transactions = [
                {
                    id: 1,
                    type: 'CREDIT',
                    amount: 500.00,
                    description: 'Initial deposit',
                    date: '2023-06-15T10:30:00',
                    balanceAfter: 500.00
                },
                {
                    id: 2,
                    type: 'ESCROW_DEPOSIT',
                    amount: 200.00,
                    description: 'Money moved to escrow for booking #123',
                    date: '2023-06-16T14:15:00',
                    balanceAfter: 300.00,
                    escrowBalanceAfter: 200.00
                },
                {
                    id: 3,
                    type: 'ESCROW_RELEASE',
                    amount: 200.00,
                    description: 'Money released from escrow for booking #123',
                    date: '2023-06-17T16:45:00',
                    balanceAfter: 480.00, // After 10% commission
                    escrowBalanceAfter: 0.00
                }
            ];
            
            displayTransactions(transactions);
        } catch (error) {
            console.error('Error loading transactions:', error);
            transactionsList.innerHTML = `
                <div class="alert alert-danger">
                    <i class="fas fa-exclamation-triangle me-2"></i>
                    Failed to load transactions. Please try again.
                </div>
            `;
        }
    }
    
    // Display transactions
    function displayTransactions(transactions) {
        if (!transactions || transactions.length === 0) {
            transactionsList.innerHTML = `
                <div class="text-center py-5">
                    <i class="fas fa-info-circle fa-2x text-muted mb-3"></i>
                    <p class="text-muted">No transactions found</p>
                </div>
            `;
            return;
        }
        
        transactionsList.innerHTML = '';
        
        transactions.forEach(transaction => {
            const transactionCard = createTransactionCard(transaction);
            transactionsList.appendChild(transactionCard);
        });
    }
    
    // Create transaction card
    function createTransactionCard(transaction) {
        const card = document.createElement('div');
        card.className = 'transaction-card';
        
        // Format date
        const transactionDate = new Date(transaction.date);
        const formattedDate = transactionDate.toLocaleDateString() + ' ' + 
                             transactionDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
        
        // Transaction icon and color based on type
        let iconClass = 'fas fa-exchange-alt';
        let iconBg = 'bg-primary';
        let amountPrefix = '';
        
        switch (transaction.type) {
            case 'CREDIT':
                iconClass = 'fas fa-arrow-down';
                iconBg = 'bg-success';
                amountPrefix = '+';
                break;
            case 'DEBIT':
                iconClass = 'fas fa-arrow-up';
                iconBg = 'bg-danger';
                amountPrefix = '-';
                break;
            case 'ESCROW_DEPOSIT':
                iconClass = 'fas fa-lock';
                iconBg = 'bg-warning';
                amountPrefix = '-';
                break;
            case 'ESCROW_RELEASE':
                iconClass = 'fas fa-lock-open';
                iconBg = 'bg-info';
                amountPrefix = '+';
                break;
            case 'ESCROW_REFUND':
                iconClass = 'fas fa-undo';
                iconBg = 'bg-secondary';
                amountPrefix = '+';
                break;
            case 'COMMISSION_DEDUCT':
                iconClass = 'fas fa-percentage';
                iconBg = 'bg-dark';
                amountPrefix = '-';
                break;
        }
        
        card.innerHTML = `
            <div class="d-flex justify-content-between align-items-center">
                <div class="d-flex align-items-center">
                    <div class="transaction-icon ${iconBg} text-white me-3">
                        <i class="${iconClass}"></i>
                    </div>
                    <div>
                        <h6 class="mb-1">${transaction.description}</h6>
                        <small class="text-muted">${formattedDate}</small>
                    </div>
                </div>
                <div class="text-end">
                    <h5 class="mb-0 ${transaction.type.includes('CREDIT') || transaction.type.includes('RELEASE') ? 'text-success' : 'text-danger'}">
                        ${amountPrefix}₹${transaction.amount.toFixed(2)}
                    </h5>
                    <small class="text-muted">
                        Balance: ₹${(transaction.balanceAfter || 0).toFixed(2)}
                        ${transaction.escrowBalanceAfter !== undefined ? 
                            ` | Escrow: ₹${transaction.escrowBalanceAfter.toFixed(2)}` : ''}
                    </small>
                </div>
            </div>
        `;
        
        return card;
    }
    
    // Deposit money
    depositBtn.addEventListener('click', async function() {
        const amount = document.getElementById('depositAmount').value;
        const description = document.getElementById('depositDescription').value;
        const reference = document.getElementById('depositReference').value;
        
        if (!amount || !description || !reference) {
            alert('Please fill in all fields');
            return;
        }
        
        try {
            const response = await fetch('/api/wallet/deposit', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + localStorage.getItem('token')
                },
                body: JSON.stringify({
                    amount: parseFloat(amount),
                    description: description,
                    referenceId: reference
                })
            });
            
            if (response.ok) {
                const result = await response.json();
                alert('Money deposited successfully!');
                
                // Close modal
                const modal = bootstrap.Modal.getInstance(document.getElementById('depositModal'));
                modal.hide();
                
                // Reset form
                document.getElementById('depositForm').reset();
                
                // Reload data
                await loadWalletData();
                await loadTransactions();
            } else {
                const error = await response.json();
                alert('Error depositing money: ' + (error.error || 'Unknown error'));
            }
        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred while depositing money.');
        }
    });
    
    // Transfer to escrow
    transferBtn.addEventListener('click', async function() {
        const amount = document.getElementById('transferAmount').value;
        const bookingId = document.getElementById('bookingId').value;
        
        if (!amount || !bookingId) {
            alert('Please fill in all fields');
            return;
        }
        
        try {
            const response = await fetch('/api/wallet/escrow/deposit', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + localStorage.getItem('token')
                },
                body: JSON.stringify({
                    amount: parseFloat(amount),
                    bookingId: parseInt(bookingId)
                })
            });
            
            if (response.ok) {
                const result = await response.json();
                alert('Money transferred to escrow successfully!');
                
                // Close modal
                const modal = bootstrap.Modal.getInstance(document.getElementById('transferModal'));
                modal.hide();
                
                // Reset form
                document.getElementById('transferForm').reset();
                
                // Reload data
                await loadWalletData();
                await loadTransactions();
            } else {
                const error = await response.json();
                alert('Error transferring money: ' + (error.error || 'Unknown error'));
            }
        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred while transferring money.');
        }
    });
});