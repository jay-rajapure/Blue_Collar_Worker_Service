package com.byteminds.blue.colller.worker.service.request;

import java.time.LocalDateTime;

public class AutoBookingRequest {
    private Long workId;  // Only need workId, not workerId - system will auto-assign
    private String description;
    private LocalDateTime scheduledDate;
    private String customerAddress;
    private String customerPhone;
    private String specialInstructions;
    private Double customerLatitude;  // For location-based worker matching
    private Double customerLongitude;
    
    // Constructors
    public AutoBookingRequest() {}
    
    public AutoBookingRequest(Long workId, String description, 
                         LocalDateTime scheduledDate, String customerAddress) {
        this.workId = workId;
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
    
    public Double getCustomerLatitude() {
        return customerLatitude;
    }
    
    public void setCustomerLatitude(Double customerLatitude) {
        this.customerLatitude = customerLatitude;
    }
    
    public Double getCustomerLongitude() {
        return customerLongitude;
    }
    
    public void setCustomerLongitude(Double customerLongitude) {
        this.customerLongitude = customerLongitude;
    }
}