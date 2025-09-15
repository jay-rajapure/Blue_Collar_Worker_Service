package com.byteminds.blue.colller.worker.service.request;

public class WorkerProfileUpdateRequest {
    private String bio;
    private String skills;
    private String certifications;
    private Integer experienceYears;
    private Boolean isAvailable;
    private Double latitude;
    private Double longitude;
    private String city;
    private String address;
    
    // Constructors
    public WorkerProfileUpdateRequest() {}
    
    // Getters and Setters
    public String getBio() {
        return bio;
    }
    
    public void setBio(String bio) {
        this.bio = bio;
    }
    
    public String getSkills() {
        return skills;
    }
    
    public void setSkills(String skills) {
        this.skills = skills;
    }
    
    public String getCertifications() {
        return certifications;
    }
    
    public void setCertifications(String certifications) {
        this.certifications = certifications;
    }
    
    public Integer getExperienceYears() {
        return experienceYears;
    }
    
    public void setExperienceYears(Integer experienceYears) {
        this.experienceYears = experienceYears;
    }
    
    public Boolean getIsAvailable() {
        return isAvailable;
    }
    
    public void setIsAvailable(Boolean isAvailable) {
        this.isAvailable = isAvailable;
    }
    
    public Double getLatitude() {
        return latitude;
    }
    
    public void setLatitude(Double latitude) {
        this.latitude = latitude;
    }
    
    public Double getLongitude() {
        return longitude;
    }
    
    public void setLongitude(Double longitude) {
        this.longitude = longitude;
    }
    
    public String getCity() {
        return city;
    }
    
    public void setCity(String city) {
        this.city = city;
    }
    
    public String getAddress() {
        return address;
    }
    
    public void setAddress(String address) {
        this.address = address;
    }
}