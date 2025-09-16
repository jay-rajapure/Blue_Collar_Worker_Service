package com.byteminds.blue.colller.worker.service.models;

public enum NegotiationStatus {
    PENDING,        // Negotiation is in progress
    ACCEPTED,       // Customer accepted the worker's counter-offer
    REJECTED,       // Customer rejected the worker's counter-offer
    CANCELLED,      // Negotiation was cancelled
    EXPIRED         // Negotiation expired without resolution
}