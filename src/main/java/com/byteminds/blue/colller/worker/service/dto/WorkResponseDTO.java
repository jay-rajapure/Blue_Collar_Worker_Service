package com.byteminds.blue.colller.worker.service.dto;

import java.time.LocalDateTime;

public class WorkResponseDTO {
    private Long id;
    private String title;
    private String description;
    private Double charges;
    private Double estimatedTimeHours;
    private String category;
    private Double latitude;
    private Double longitude;
    private Boolean isAvailable;
    private LocalDateTime createdAt;
    
    // Worker information (simplified)
    private Long workerId;
    private String workerName;
    private String workerEmail;
    private Double workerRating;
    private Integer workerExperience;
    private String workerSkills;
    private String workerProfileImage; // Base64 encoded profile image
    
    // Constructors
    public WorkResponseDTO() {}
    
    public WorkResponseDTO(Long id, String title, String description, Double charges, 
                          Double estimatedTimeHours, String category, Double latitude, 
                          Double longitude, Boolean isAvailable, LocalDateTime createdAt,
                          Long workerId, String workerName, String workerEmail, 
                          Double workerRating, Integer workerExperience, String workerSkills,
                          String workerProfileImage) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.charges = charges;
        this.estimatedTimeHours = estimatedTimeHours;
        this.category = category;
        this.latitude = latitude;
        this.longitude = longitude;
        this.isAvailable = isAvailable;
        this.createdAt = createdAt;
        this.workerId = workerId;
        this.workerName = workerName;
        this.workerEmail = workerEmail;
        this.workerRating = workerRating;
        this.workerExperience = workerExperience;
        this.workerSkills = workerSkills;
        this.workerProfileImage = workerProfileImage;
    }

    // Getters and setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    
    public Double getCharges() { return charges; }
    public void setCharges(Double charges) { this.charges = charges; }
    
    public Double getEstimatedTimeHours() { return estimatedTimeHours; }
    public void setEstimatedTimeHours(Double estimatedTimeHours) { this.estimatedTimeHours = estimatedTimeHours; }
    
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    
    public Double getLatitude() { return latitude; }
    public void setLatitude(Double latitude) { this.latitude = latitude; }
    
    public Double getLongitude() { return longitude; }
    public void setLongitude(Double longitude) { this.longitude = longitude; }
    
    public Boolean getIsAvailable() { return isAvailable; }
    public void setIsAvailable(Boolean isAvailable) { this.isAvailable = isAvailable; }
    
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    
    public Long getWorkerId() { return workerId; }
    public void setWorkerId(Long workerId) { this.workerId = workerId; }
    
    public String getWorkerName() { return workerName; }
    public void setWorkerName(String workerName) { this.workerName = workerName; }
    
    public String getWorkerEmail() { return workerEmail; }
    public void setWorkerEmail(String workerEmail) { this.workerEmail = workerEmail; }
    
    public Double getWorkerRating() { return workerRating; }
    public void setWorkerRating(Double workerRating) { this.workerRating = workerRating; }
    
    public Integer getWorkerExperience() { return workerExperience; }
    public void setWorkerExperience(Integer workerExperience) { this.workerExperience = workerExperience; }
    
    public String getWorkerSkills() { return workerSkills; }
    public void setWorkerSkills(String workerSkills) { this.workerSkills = workerSkills; }
    
    public String getWorkerProfileImage() { return workerProfileImage; }
    public void setWorkerProfileImage(String workerProfileImage) { this.workerProfileImage = workerProfileImage; }
}