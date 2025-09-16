package com.byteminds.blue.colller.worker.service.models;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "wallet_transactions")
public class WalletTransaction {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "wallet_id", nullable = false)
    private Wallet wallet;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "transaction_type", nullable = false)
    private TransactionType transactionType;
    
    @Column(name = "amount", nullable = false)
    private Double amount;
    
    @Column(name = "balance_before", nullable = false)
    private Double balanceBefore;
    
    @Column(name = "balance_after", nullable = false)
    private Double balanceAfter;
    
    @Column(name = "escrow_balance_before")
    private Double escrowBalanceBefore;
    
    @Column(name = "escrow_balance_after")
    private Double escrowBalanceAfter;
    
    @Column(name = "description")
    private String description;
    
    @Column(name = "reference_id")
    private String referenceId;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
    
    // Constructors
    public WalletTransaction() {}
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public Wallet getWallet() {
        return wallet;
    }
    
    public void setWallet(Wallet wallet) {
        this.wallet = wallet;
    }
    
    public TransactionType getTransactionType() {
        return transactionType;
    }
    
    public void setTransactionType(TransactionType transactionType) {
        this.transactionType = transactionType;
    }
    
    public Double getAmount() {
        return amount;
    }
    
    public void setAmount(Double amount) {
        this.amount = amount;
    }
    
    public Double getBalanceBefore() {
        return balanceBefore;
    }
    
    public void setBalanceBefore(Double balanceBefore) {
        this.balanceBefore = balanceBefore;
    }
    
    public Double getBalanceAfter() {
        return balanceAfter;
    }
    
    public void setBalanceAfter(Double balanceAfter) {
        this.balanceAfter = balanceAfter;
    }
    
    public Double getEscrowBalanceBefore() {
        return escrowBalanceBefore;
    }
    
    public void setEscrowBalanceBefore(Double escrowBalanceBefore) {
        this.escrowBalanceBefore = escrowBalanceBefore;
    }
    
    public Double getEscrowBalanceAfter() {
        return escrowBalanceAfter;
    }
    
    public void setEscrowBalanceAfter(Double escrowBalanceAfter) {
        this.escrowBalanceAfter = escrowBalanceAfter;
    }
    
    public String getDescription() {
        return description;
    }
    
    public void setDescription(String description) {
        this.description = description;
    }
    
    public String getReferenceId() {
        return referenceId;
    }
    
    public void setReferenceId(String referenceId) {
        this.referenceId = referenceId;
    }
    
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}