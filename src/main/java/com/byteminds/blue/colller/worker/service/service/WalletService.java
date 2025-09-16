package com.byteminds.blue.colller.worker.service.service;

import com.byteminds.blue.colller.worker.service.Repository.BookingRepository;
import com.byteminds.blue.colller.worker.service.Repository.UsersRepository;
import com.byteminds.blue.colller.worker.service.Repository.WalletRepository;
import com.byteminds.blue.colller.worker.service.Repository.WalletTransactionRepository;
import com.byteminds.blue.colller.worker.service.models.Booking;
import com.byteminds.blue.colller.worker.service.models.TransactionType;
import com.byteminds.blue.colller.worker.service.models.Users;
import com.byteminds.blue.colller.worker.service.models.Wallet;
import com.byteminds.blue.colller.worker.service.models.WalletTransaction;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class WalletService {
    
    @Autowired
    private WalletRepository walletRepository;
    
    @Autowired
    private WalletTransactionRepository walletTransactionRepository;
    
    @Autowired
    private BookingRepository bookingRepository;
    
    @Autowired
    private UsersRepository usersRepository;
    
    /**
     * Get or create wallet for user
     */
    public Wallet getOrCreateWallet(Long userId) throws Exception {
        Optional<Wallet> walletOpt = walletRepository.findByUserId(userId);
        if (walletOpt.isPresent()) {
            return walletOpt.get();
        }
        
        // Create new wallet
        Optional<Users> userOpt = usersRepository.findById(userId);
        if (userOpt.isEmpty()) {
            throw new Exception("User not found");
        }
        
        Users user = userOpt.get();
        Wallet newWallet = new Wallet(user);
        return walletRepository.save(newWallet);
    }
    
    /**
     * Deposit money to wallet
     */
    public Wallet depositToWallet(Long walletId, Double amount, String description, String referenceId) throws Exception {
        Optional<Wallet> walletOpt = walletRepository.findById(walletId);
        if (walletOpt.isEmpty()) {
            throw new Exception("Wallet not found");
        }
        
        Wallet wallet = walletOpt.get();
        Double oldBalance = wallet.getBalance() != null ? wallet.getBalance() : 0.0;
        wallet.setBalance(oldBalance + amount);
        
        Wallet updatedWallet = walletRepository.save(wallet);
        
        // Create transaction record
        WalletTransaction transaction = new WalletTransaction();
        transaction.setWallet(wallet);
        transaction.setTransactionType(TransactionType.CREDIT);
        transaction.setAmount(amount);
        transaction.setBalanceBefore(oldBalance);
        transaction.setBalanceAfter(oldBalance + amount);
        transaction.setDescription(description);
        transaction.setReferenceId(referenceId);
        
        walletTransactionRepository.save(transaction);
        
        return updatedWallet;
    }
    
    /**
     * Move money to escrow for booking
     */
    public Wallet moveMoneyToEscrow(Long walletId, Long bookingId, Double amount) throws Exception {
        Optional<Wallet> walletOpt = walletRepository.findById(walletId);
        if (walletOpt.isEmpty()) {
            throw new Exception("Wallet not found");
        }
        
        Optional<Booking> bookingOpt = bookingRepository.findById(bookingId);
        if (bookingOpt.isEmpty()) {
            throw new Exception("Booking not found");
        }
        
        Wallet wallet = walletOpt.get();
        Double balance = wallet.getBalance() != null ? wallet.getBalance() : 0.0;
        Double escrowBalance = wallet.getEscrowBalance() != null ? wallet.getEscrowBalance() : 0.0;
        
        if (balance < amount) {
            throw new Exception("Insufficient funds in wallet");
        }
        
        // Move money from balance to escrow
        wallet.setBalance(balance - amount);
        wallet.setEscrowBalance(escrowBalance + amount);
        
        Wallet updatedWallet = walletRepository.save(wallet);
        
        // Create transaction record
        WalletTransaction transaction = new WalletTransaction();
        transaction.setWallet(wallet);
        transaction.setTransactionType(TransactionType.ESCROW_DEPOSIT);
        transaction.setAmount(amount);
        transaction.setBalanceBefore(balance);
        transaction.setBalanceAfter(balance - amount);
        transaction.setEscrowBalanceBefore(escrowBalance);
        transaction.setEscrowBalanceAfter(escrowBalance + amount);
        transaction.setDescription("Money moved to escrow for booking #" + bookingId);
        transaction.setReferenceId("BOOKING_" + bookingId);
        
        walletTransactionRepository.save(transaction);
        
        return updatedWallet;
    }
    
    /**
     * Release money from escrow to worker
     */
    public Wallet releaseMoneyFromEscrow(Long walletId, Long bookingId, Double amount, Double commission) throws Exception {
        Optional<Wallet> walletOpt = walletRepository.findById(walletId);
        if (walletOpt.isEmpty()) {
            throw new Exception("Wallet not found");
        }
        
        Optional<Booking> bookingOpt = bookingRepository.findById(bookingId);
        if (bookingOpt.isEmpty()) {
            throw new Exception("Booking not found");
        }
        
        Wallet wallet = walletOpt.get();
        Double balance = wallet.getBalance() != null ? wallet.getBalance() : 0.0;
        Double escrowBalance = wallet.getEscrowBalance() != null ? wallet.getEscrowBalance() : 0.0;
        
        if (escrowBalance < amount) {
            throw new Exception("Insufficient funds in escrow");
        }
        
        // Deduct commission first
        Double amountAfterCommission = amount - commission;
        
        // Move money from escrow to balance
        wallet.setBalance(balance + amountAfterCommission);
        wallet.setEscrowBalance(escrowBalance - amount);
        
        Wallet updatedWallet = walletRepository.save(wallet);
        
        // Create transaction record for release
        WalletTransaction releaseTransaction = new WalletTransaction();
        releaseTransaction.setWallet(wallet);
        releaseTransaction.setTransactionType(TransactionType.ESCROW_RELEASE);
        releaseTransaction.setAmount(amount);
        releaseTransaction.setBalanceBefore(balance);
        releaseTransaction.setBalanceAfter(balance + amountAfterCommission);
        releaseTransaction.setEscrowBalanceBefore(escrowBalance);
        releaseTransaction.setEscrowBalanceAfter(escrowBalance - amount);
        releaseTransaction.setDescription("Money released from escrow for booking #" + bookingId);
        releaseTransaction.setReferenceId("BOOKING_" + bookingId);
        
        walletTransactionRepository.save(releaseTransaction);
        
        // Create transaction record for commission
        if (commission > 0) {
            WalletTransaction commissionTransaction = new WalletTransaction();
            commissionTransaction.setWallet(wallet);
            commissionTransaction.setTransactionType(TransactionType.COMMISSION_DEDUCT);
            commissionTransaction.setAmount(commission);
            commissionTransaction.setBalanceBefore(balance + amountAfterCommission);
            commissionTransaction.setBalanceAfter(balance + amountAfterCommission); // Commission goes to platform
            commissionTransaction.setEscrowBalanceBefore(escrowBalance - amount);
            commissionTransaction.setEscrowBalanceAfter(escrowBalance - amount);
            commissionTransaction.setDescription("Commission deducted for booking #" + bookingId);
            commissionTransaction.setReferenceId("BOOKING_" + bookingId);
            
            walletTransactionRepository.save(commissionTransaction);
        }
        
        return updatedWallet;
    }
    
    /**
     * Refund money from escrow to customer
     */
    public Wallet refundMoneyFromEscrow(Long walletId, Long bookingId, Double amount) throws Exception {
        Optional<Wallet> walletOpt = walletRepository.findById(walletId);
        if (walletOpt.isEmpty()) {
            throw new Exception("Wallet not found");
        }
        
        Optional<Booking> bookingOpt = bookingRepository.findById(bookingId);
        if (bookingOpt.isEmpty()) {
            throw new Exception("Booking not found");
        }
        
        Wallet wallet = walletOpt.get();
        Double balance = wallet.getBalance() != null ? wallet.getBalance() : 0.0;
        Double escrowBalance = wallet.getEscrowBalance() != null ? wallet.getEscrowBalance() : 0.0;
        
        if (escrowBalance < amount) {
            throw new Exception("Insufficient funds in escrow");
        }
        
        // Move money from escrow back to balance
        wallet.setBalance(balance + amount);
        wallet.setEscrowBalance(escrowBalance - amount);
        
        Wallet updatedWallet = walletRepository.save(wallet);
        
        // Create transaction record
        WalletTransaction transaction = new WalletTransaction();
        transaction.setWallet(wallet);
        transaction.setTransactionType(TransactionType.ESCROW_REFUND);
        transaction.setAmount(amount);
        transaction.setBalanceBefore(balance);
        transaction.setBalanceAfter(balance + amount);
        transaction.setEscrowBalanceBefore(escrowBalance);
        transaction.setEscrowBalanceAfter(escrowBalance - amount);
        transaction.setDescription("Money refunded from escrow for booking #" + bookingId);
        transaction.setReferenceId("BOOKING_" + bookingId);
        
        walletTransactionRepository.save(transaction);
        
        return updatedWallet;
    }
    
    /**
     * Get wallet by ID
     */
    public Optional<Wallet> getWalletById(Long walletId) {
        return walletRepository.findById(walletId);
    }
    
    /**
     * Get wallet by user ID
     */
    public Optional<Wallet> getWalletByUserId(Long userId) {
        return walletRepository.findByUserId(userId);
    }
}