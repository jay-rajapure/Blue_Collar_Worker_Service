package com.byteminds.blue.colller.worker.service.models;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "worker_assignments")
public class WorkerAssignment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "booking_id", nullable = false)
    private Booking booking;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "worker_id", nullable = false)
    private Users worker;
    
    @Column(name = "assignment_order", nullable = false)
    private Integer assignmentOrder; // 1 for first attempt, 2 for second, etc.
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AssignmentStatus status = AssignmentStatus.ASSIGNED;
    
    @Column(name = "rejection_reason")
    private String rejectionReason;
    
    @Column(name = "assigned_at", nullable = false)
    private LocalDateTime assignedAt;
    
    @Column(name = "response_at")
    private LocalDateTime responseAt;
    
    @PrePersist
    protected void onCreate() {
        assignedAt = LocalDateTime.now();
    }
    
    // Constructors
    public WorkerAssignment() {}
    
    public WorkerAssignment(Booking booking, Users worker, Integer assignmentOrder) {
        this.booking = booking;
        this.worker = worker;
        this.assignmentOrder = assignmentOrder;
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
    
    public Users getWorker() {
        return worker;
    }
    
    public void setWorker(Users worker) {
        this.worker = worker;
    }
    
    public Integer getAssignmentOrder() {
        return assignmentOrder;
    }
    
    public void setAssignmentOrder(Integer assignmentOrder) {
        this.assignmentOrder = assignmentOrder;
    }
    
    public AssignmentStatus getStatus() {
        return status;
    }
    
    public void setStatus(AssignmentStatus status) {
        this.status = status;
    }
    
    public String getRejectionReason() {
        return rejectionReason;
    }
    
    public void setRejectionReason(String rejectionReason) {
        this.rejectionReason = rejectionReason;
    }
    
    public LocalDateTime getAssignedAt() {
        return assignedAt;
    }
    
    public void setAssignedAt(LocalDateTime assignedAt) {
        this.assignedAt = assignedAt;
    }
    
    public LocalDateTime getResponseAt() {
        return responseAt;
    }
    
    public void setResponseAt(LocalDateTime responseAt) {
        this.responseAt = responseAt;
    }
}