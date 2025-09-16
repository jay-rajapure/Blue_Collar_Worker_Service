package com.byteminds.blue.colller.worker.service.models;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "negotiations")
public class Negotiation {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "booking_id", nullable = false)
    private Booking booking;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id", nullable = false)
    private Users customer;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "worker_id", nullable = false)
    private Users worker;
    
    @Column(name = "proposed_amount")
    private Double proposedAmount;
    
    @Column(name = "customer_message")
    private String customerMessage;
    
    @Column(name = "worker_message")
    private String workerMessage;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private NegotiationStatus status = NegotiationStatus.PENDING;
    
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
    public Negotiation() {}
    
    public Negotiation(Booking booking, Users customer, Users worker, Double proposedAmount, String customerMessage) {
        this.booking = booking;
        this.customer = customer;
        this.worker = worker;
        this.proposedAmount = proposedAmount;
        this.customerMessage = customerMessage;
        this.status = NegotiationStatus.PENDING;
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public Booking getBooking() {
        return booking;
    }
    
    public void setBooking(Booking booking) {
        this.booking = booking;
    }
    
    public Users getCustomer() {
        return customer;
    }
    
    public void setCustomer(Users customer) {
        this.customer = customer;
    }
    
    public Users getWorker() {
        return worker;
    }
    
    public void setWorker(Users worker) {
        this.worker = worker;
    }
    
    public Double getProposedAmount() {
        return proposedAmount;
    }
    
    public void setProposedAmount(Double proposedAmount) {
        this.proposedAmount = proposedAmount;
    }
    
    public String getCustomerMessage() {
        return customerMessage;
    }
    
    public void setCustomerMessage(String customerMessage) {
        this.customerMessage = customerMessage;
    }
    
    public String getWorkerMessage() {
        return workerMessage;
    }
    
    public void setWorkerMessage(String workerMessage) {
        this.workerMessage = workerMessage;
    }
    
    public NegotiationStatus getStatus() {
        return status;
    }
    
    public void setStatus(NegotiationStatus status) {
        this.status = status;
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
}