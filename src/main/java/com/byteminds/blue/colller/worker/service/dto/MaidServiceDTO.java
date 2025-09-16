package com.byteminds.blue.colller.worker.service.dto;

public class MaidServiceDTO {
    private String serviceName;
    private String description;
    private String serviceType;
    private Double dailyRate;
    private Double monthlyRate;
    private Boolean isAvailable;
    
    // Constructors
    public MaidServiceDTO() {}
    
    public MaidServiceDTO(String serviceName, String description, String serviceType, Double dailyRate, Double monthlyRate, Boolean isAvailable) {
        this.serviceName = serviceName;
        this.description = description;
        this.serviceType = serviceType;
        this.dailyRate = dailyRate;
        this.monthlyRate = monthlyRate;
        this.isAvailable = isAvailable;
    }
    
    // Getters and Setters
    public String getServiceName() { return serviceName; }
    public void setServiceName(String serviceName) { this.serviceName = serviceName; }
    
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    
    public String getServiceType() { return serviceType; }
    public void setServiceType(String serviceType) { this.serviceType = serviceType; }
    
    public Double getDailyRate() { return dailyRate; }
    public void setDailyRate(Double dailyRate) { this.dailyRate = dailyRate; }
    
    public Double getMonthlyRate() { return monthlyRate; }
    public void setMonthlyRate(Double monthlyRate) { this.monthlyRate = monthlyRate; }
    
    public Boolean getIsAvailable() { return isAvailable; }
    public void setIsAvailable(Boolean isAvailable) { this.isAvailable = isAvailable; }
}

class MaidServiceResponseDTO {
    private Long id;
    private String serviceName;
    private String description;
    private String serviceType;
    private Double dailyRate;
    private Double monthlyRate;
    private Boolean isAvailable;
    private String workerName;
    private String workerEmail;
    private Long workerId;
    
    // Constructors
    public MaidServiceResponseDTO() {}
    
    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public String getServiceName() { return serviceName; }
    public void setServiceName(String serviceName) { this.serviceName = serviceName; }
    
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    
    public String getServiceType() { return serviceType; }
    public void setServiceType(String serviceType) { this.serviceType = serviceType; }
    
    public Double getDailyRate() { return dailyRate; }
    public void setDailyRate(Double dailyRate) { this.dailyRate = dailyRate; }
    
    public Double getMonthlyRate() { return monthlyRate; }
    public void setMonthlyRate(Double monthlyRate) { this.monthlyRate = monthlyRate; }
    
    public Boolean getIsAvailable() { return isAvailable; }
    public void setIsAvailable(Boolean isAvailable) { this.isAvailable = isAvailable; }
    
    public String getWorkerName() { return workerName; }
    public void setWorkerName(String workerName) { this.workerName = workerName; }
    
    public String getWorkerEmail() { return workerEmail; }
    public void setWorkerEmail(String workerEmail) { this.workerEmail = workerEmail; }
    
    public Long getWorkerId() { return workerId; }
    public void setWorkerId(Long workerId) { this.workerId = workerId; }
}