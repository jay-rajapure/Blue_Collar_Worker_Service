package com.byteminds.blue.colller.worker.service.models;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "caretaker_services")
public class CaretakerService {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "service_name", nullable = false)
    private String serviceName;
    
    @Column(columnDefinition = "TEXT")
    private String description;
    
    @Column(name = "service_type")
    private String serviceType;
    
    @Column(name = "hourly_rate")
    private Double hourlyRate;
    
    @Column(name = "daily_rate")
    private Double dailyRate;
    
    @Column(name = "monthly_rate")
    private Double monthlyRate;
    
    @Column(name = "is_available")
    private Boolean isAvailable = true;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "worker_id", nullable = false)
    private Users worker;
    
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
    public CaretakerService() {}
    
    public CaretakerService(String serviceName, String description, String serviceType, 
                           Double hourlyRate, Double dailyRate, Double monthlyRate, 
                           Boolean isAvailable, Users worker) {
        this.serviceName = serviceName;
        this.description = description;
        this.serviceType = serviceType;
        this.hourlyRate = hourlyRate;
        this.dailyRate = dailyRate;
        this.monthlyRate = monthlyRate;
        this.isAvailable = isAvailable != null ? isAvailable : true;
        this.worker = worker;
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
    
    public Users getWorker() {
        return worker;
    }
    
    public void setWorker(Users worker) {
        this.worker = worker;
    }
}