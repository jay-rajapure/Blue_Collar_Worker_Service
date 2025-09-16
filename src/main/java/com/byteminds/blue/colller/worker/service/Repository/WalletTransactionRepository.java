package com.byteminds.blue.colller.worker.service.Repository;

import com.byteminds.blue.colller.worker.service.models.WalletTransaction;
import com.byteminds.blue.colller.worker.service.models.TransactionType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface WalletTransactionRepository extends JpaRepository<WalletTransaction, Long> {
    
    // Find transactions by wallet ID
    List<WalletTransaction> findByWalletId(Long walletId);
    
    // Find transactions by transaction type
    List<WalletTransaction> findByTransactionType(TransactionType transactionType);
    
    // Find transactions by reference ID
    List<WalletTransaction> findByReferenceId(String referenceId);
}