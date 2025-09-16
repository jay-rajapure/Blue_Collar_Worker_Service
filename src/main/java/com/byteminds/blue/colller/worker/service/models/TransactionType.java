package com.byteminds.blue.colller.worker.service.models;

public enum TransactionType {
    CREDIT,             // Money added to wallet
    DEBIT,              // Money deducted from wallet
    ESCROW_DEPOSIT,     // Money moved to escrow for booking
    ESCROW_RELEASE,     // Money released from escrow to worker
    ESCROW_REFUND,      // Money refunded from escrow to customer
    COMMISSION_DEDUCT   // Commission deducted from escrow
}