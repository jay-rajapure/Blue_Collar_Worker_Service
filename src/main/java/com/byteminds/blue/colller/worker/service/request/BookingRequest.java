package com.byteminds.blue.colller.worker.service.request;

import java.time.LocalDateTime;

public class BookingRequest {
    private Long workId;
    private Long workerId;
    private String description;
    private LocalDateTime scheduledDate;
    private String customerAddress;
    private String customerPhone;
    private String specialInstructions;
    
    // Constructors
    public BookingRequest() {}
    
    public BookingRequest(Long workId, Long workerId, String description, 
                         LocalDateTime scheduledDate, String customerAddress) {
        this.workId = workId;
        this.workerId = workerId;
        this.description = description;
        this.scheduledDate = scheduledDate;
        this.customerAddress = customerAddress;
    }
    
    // Getters and Setters
    public Long getWorkId() {
        return workId;
    }
    
    public void setWorkId(Long workId) {
        this.workId = workId;
    }
    
    public Long getWorkerId() {
        return workerId;
    }
    
    public void setWorkerId(Long workerId) {
        this.workerId = workerId;
    }
    
    public String getDescription() {
        return description;
    }
    
    public void setDescription(String description) {
        this.description = description;
    }
    
    public LocalDateTime getScheduledDate() {
        return scheduledDate;
    }
    
    public void setScheduledDate(LocalDateTime scheduledDate) {
        this.scheduledDate = scheduledDate;
    }
    
    public String getCustomerAddress() {
        return customerAddress;
    }
    
    public void setCustomerAddress(String customerAddress) {
        this.customerAddress = customerAddress;
    }
    
    public String getCustomerPhone() {
        return customerPhone;
    }
    
    public void setCustomerPhone(String customerPhone) {
        this.customerPhone = customerPhone;
    }
    
    public String getSpecialInstructions() {
        return specialInstructions;
    }
    
    public void setSpecialInstructions(String specialInstructions) {
        this.specialInstructions = specialInstructions;
    }
}
