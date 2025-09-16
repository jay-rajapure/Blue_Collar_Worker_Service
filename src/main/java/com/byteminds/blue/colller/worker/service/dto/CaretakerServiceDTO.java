package com.byteminds.blue.colller.worker.service.dto;

import java.time.LocalDateTime;

public class CaretakerServiceDTO {
    private Long id;
    private String serviceName;
    private String description;
    private String serviceType;
    private Double hourlyRate;
    private Double dailyRate;
    private Double monthlyRate;
    private Boolean isAvailable;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Long workerId;
    private String workerName;
    private String workerEmail;
    private String workerPhone;
    private String workerProfileImage;
    
    // Constructors
    public CaretakerServiceDTO() {}
    
    public CaretakerServiceDTO(Long id, String serviceName, String description, String serviceType,
                              Double hourlyRate, Double dailyRate, Double monthlyRate, Boolean isAvailable,
                              LocalDateTime createdAt, LocalDateTime updatedAt, Long workerId,
                              String workerName, String workerEmail, String workerPhone, String workerProfileImage) {
        this.id = id;
        this.serviceName = serviceName;
        this.description = description;
        this.serviceType = serviceType;
        this.hourlyRate = hourlyRate;
        this.dailyRate = dailyRate;
        this.monthlyRate = monthlyRate;
        this.isAvailable = isAvailable;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.workerId = workerId;
        this.workerName = workerName;
        this.workerEmail = workerEmail;
        this.workerPhone = workerPhone;
        this.workerProfileImage = workerProfileImage;
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public String getServiceName() {
        return serviceName;
    }
    
    public void setServiceName(String serviceName) {
        this.serviceName = serviceName;
    }
    
    public String getDescription() {
        return description;
    }
    
    public void setDescription(String description) {
        this.description = description;
    }
    
    public String getServiceType() {
        return serviceType;
    }
    
    public void setServiceType(String serviceType) {
        this.serviceType = serviceType;
    }
    
    public Double getHourlyRate() {
        return hourlyRate;
    }
    
    public void setHourlyRate(Double hourlyRate) {
        this.hourlyRate = hourlyRate;
    }
    
    public Double getDailyRate() {
        return dailyRate;
    }
    
    public void setDailyRate(Double dailyRate) {
        this.dailyRate = dailyRate;
    }
    
    public Double getMonthlyRate() {
        return monthlyRate;
    }
    
    public void setMonthlyRate(Double monthlyRate) {
        this.monthlyRate = monthlyRate;
    }
    
    public Boolean getIsAvailable() {
        return isAvailable;
    }
    
    public void setIsAvailable(Boolean isAvailable) {
        this.isAvailable = isAvailable;
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
    
    public Long getWorkerId() {
        return workerId;
    }
    
    public void setWorkerId(Long workerId) {
        this.workerId = workerId;
    }
    
    public String getWorkerName() {
        return workerName;
    }
    
    public void setWorkerName(String workerName) {
        this.workerName = workerName;
    }
    
    public String getWorkerEmail() {
        return workerEmail;
    }
    
    public void setWorkerEmail(String workerEmail) {
        this.workerEmail = workerEmail;
    }
    
    public String getWorkerPhone() {
        return workerPhone;
    }
    
    public void setWorkerPhone(String workerPhone) {
        this.workerPhone = workerPhone;
    }
    
    public String getWorkerProfileImage() {
        return workerProfileImage;
    }
    
    public void setWorkerProfileImage(String workerProfileImage) {
        this.workerProfileImage = workerProfileImage;
    }
}