package com.byteminds.blue.colller.worker.service.Controller;



import com.byteminds.blue.colller.worker.service.dto.WorkResponseDTO;
import com.byteminds.blue.colller.worker.service.models.Users;
import com.byteminds.blue.colller.worker.service.models.Work;
import com.byteminds.blue.colller.worker.service.service.UsersService;
import com.byteminds.blue.colller.worker.service.service.WorkService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/works")
public class WorkController {

    private final WorkService workService;
    @Autowired
    private UsersService usersService;

    public WorkController(WorkService workService) {
        this.workService = workService;
    }

    // ✅ Create Work (with optional image upload)
    @PostMapping(consumes = { MediaType.MULTIPART_FORM_DATA_VALUE })
    public ResponseEntity<Work> createWork(
            @RequestHeader("Authorization") String jwt,
            @RequestParam String title,
            @RequestParam String description,
            @RequestParam Double charges,
            @RequestParam Double estimatedTimeHours,
            @RequestParam String category,
            @RequestParam(required = false) Double latitude,
            @RequestParam(required = false) Double longitude,
            @RequestParam(required = false) MultipartFile image) {
        try {
            Users user = usersService.findByJwtToken(jwt);
            Work work = workService.createWork(
                    user.getId(), title, description, charges, estimatedTimeHours, category, latitude, longitude, image
            );
            return new ResponseEntity<>(work, HttpStatus.CREATED);
        } catch (Exception e) {
            e.printStackTrace();
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // ✅ Get all Works (admin/general use)
    @GetMapping
    public ResponseEntity<List<Work>> getAllWorks() {
        return ResponseEntity.ok(workService.getAllWork());
    }

    // ✅ Get Works for Customer view - available services to book
    @GetMapping("/customer")
    public ResponseEntity<List<WorkResponseDTO>> getWorksForCustomer(
            @RequestHeader("Authorization") String jwt) {
        try {
            System.out.println("Customer endpoint called with JWT: " + jwt.substring(0, 20) + "...");
            
            Users user = usersService.findByJwtToken(jwt);
            System.out.println("User found: " + user.getEmail() + ", Role: " + user.getRole());
            
            if (!"CUSTOMER".equals(user.getRole().toString())) {
                System.out.println("Access denied: User role is " + user.getRole() + ", expected CUSTOMER");
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }
            
            System.out.println("Fetching available works for customers...");
            // Return only available works from active workers that customers can book
            List<Work> availableWorks = workService.getAvailableWorksForCustomers();
            
            // Filter to only include works from active/available workers
            List<Work> activeWorkerWorks = availableWorks.stream()
                .filter(work -> work.getWorker() != null && 
                              work.getWorker().getIsAvailable() != null && 
                              work.getWorker().getIsAvailable() && 
                              work.getAvailable())
                .collect(Collectors.toList());
            
            System.out.println("Found " + activeWorkerWorks.size() + " works from active workers out of " + availableWorks.size() + " total works");
            
            // Convert to DTO to avoid serialization issues
            List<WorkResponseDTO> workDTOs = activeWorkerWorks.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
            
            System.out.println("Successfully converted " + workDTOs.size() + " works to DTOs");
            
            return ResponseEntity.ok(workDTOs);
            
        } catch (Exception e) {
            System.err.println("Error in customer endpoint: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    // Helper method to convert Work entity to DTO
    private WorkResponseDTO convertToDTO(Work work) {
        Users worker = work.getWorker();
        
        // Convert profile image to Base64 string if available
        String profileImageBase64 = null;
        if (worker.getProfileImage() != null) {
            profileImageBase64 = java.util.Base64.getEncoder().encodeToString(worker.getProfileImage());
        }
        
        return new WorkResponseDTO(
            work.getId(),
            work.getTitle(),
            work.getDescription(),
            work.getCharges(),
            work.getEstimatedTimeHours(),
            work.getCategory(),
            work.getLatitude(),
            work.getLongitude(),
            work.getAvailable(),
            work.getCreatedAt(),
            worker.getId(),
            worker.getName(),
            worker.getEmail(),
            worker.getRating(),
            worker.getExperienceYears(),
            worker.getSkills(),
            profileImageBase64
        );
    }

    // ✅ Get Works for Worker view - their own services and management
    @GetMapping("/worker")
    public ResponseEntity<List<Work>> getWorksForWorker(
            @RequestHeader("Authorization") String jwt) {
        try {
            Users user = usersService.findByJwtToken(jwt);
            if (!"WORKER".equals(user.getRole().toString())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }
            
            // Return only works posted by this worker
            List<Work> workerWorks = workService.getWorksByWorkerId(user.getId());
            return ResponseEntity.ok(workerWorks);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
    }

    // ✅ Get available work opportunities for Worker
    @GetMapping("/opportunities")
    public ResponseEntity<List<Work>> getWorkOpportunities(
            @RequestHeader("Authorization") String jwt) {
        try {
            Users user = usersService.findByJwtToken(jwt);
            if (!"WORKER".equals(user.getRole().toString())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }
            
            // Return all available works from other workers that this worker could potentially help with
            List<Work> opportunities = workService.getWorkOpportunitiesForWorker(user.getId());
            return ResponseEntity.ok(opportunities);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
    }

    // ✅ Get Work by ID
    @GetMapping("/{id}")
    public ResponseEntity<Work> getWorkById(@PathVariable Long id) {
        Optional<Work> work = workService.getWorkById(id);
        return work.map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    // ✅ Fetch Work image (download)
    @GetMapping("/{id}/image")
    public ResponseEntity<byte[]> getWorkImage(@PathVariable Long id) {
        Optional<Work> work = workService.getWorkById(id);

        if (work.isPresent() && work.get().getImage() != null) {
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"work_" + id + ".jpg\"")
                    .contentType(MediaType.IMAGE_JPEG)
                    .body(work.get().getImage());
        }
        return ResponseEntity.notFound().build();
    }

    // ✅ Delete Work
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteWork(@PathVariable Long id) {
        workService.deleteWork(id);
        return ResponseEntity.noContent().build();
    }

    // ✅ Update Work availability
    @PatchMapping("/{id}/availability")
    public ResponseEntity<Work> updateAvailability(
            @PathVariable Long id,
            @RequestParam boolean isAvailable) {
        return ResponseEntity.ok(workService.updateAvailability(id, isAvailable));
    }
}

