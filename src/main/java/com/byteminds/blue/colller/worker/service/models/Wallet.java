package com.byteminds.blue.colller.worker.service.models;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "wallets")
public class Wallet {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private Users user;
    
    @Column(name = "balance", nullable = false)
    private Double balance = 0.0;
    
    @Column(name = "escrow_balance", nullable = false)
    private Double escrowBalance = 0.0;
    
    @Column(name = "currency", nullable = false)
    private String currency = "INR";
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
    
    // Constructors
    public Wallet() {}
    
    public Wallet(Users user) {
        this.user = user;
        this.balance = 0.0;
        this.escrowBalance = 0.0;
        this.currency = "INR";
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public Users getUser() {
        return user;
    }
    
    public void setUser(Users user) {
        this.user = user;
    }
    
    public Double getBalance() {
        return balance;
    }
    
    public void setBalance(Double balance) {
        this.balance = balance;
    }
    
    public Double getEscrowBalance() {
        return escrowBalance;
    }
    
    public void setEscrowBalance(Double escrowBalance) {
        this.escrowBalance = escrowBalance;
    }
    
    public String getCurrency() {
        return currency;
    }
    
    public void setCurrency(String currency) {
        this.currency = currency;
    }
    
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
    
    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
    
    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
    
    // Utility methods
    public Double getTotalBalance() {
        return (balance != null ? balance : 0.0) + (escrowBalance != null ? escrowBalance : 0.0);
    }
    
    public boolean hasSufficientFunds(Double amount) {
        return balance != null && balance >= amount;
    }
    
    public boolean hasSufficientEscrowFunds(Double amount) {
        return escrowBalance != null && escrowBalance >= amount;
    }
}