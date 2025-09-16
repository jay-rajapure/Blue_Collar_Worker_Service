package com.byteminds.blue.colller.worker.service.Controller;

import com.byteminds.blue.colller.worker.service.models.RecurringJob;
import com.byteminds.blue.colller.worker.service.models.Users;
import com.byteminds.blue.colller.worker.service.service.RecurringJobService;
import com.byteminds.blue.colller.worker.service.service.UsersService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/recurring-jobs")
@CrossOrigin(origins = "*")
public class RecurringJobController {
    
    @Autowired
    private RecurringJobService recurringJobService;
    
    @Autowired
    private UsersService usersService;
    
    /**
     * Create a new recurring job
     */
    @PostMapping
    public ResponseEntity<?> createRecurringJob(
            @RequestHeader("Authorization") String jwt,
            @RequestBody RecurringJob job) {
        try {
            Users customer = usersService.findByJwtToken(jwt);
            
            if (!"CUSTOMER".equals(customer.getRole().toString())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "Only customers can create recurring jobs"));
            }
            
            RecurringJob createdJob = recurringJobService.createRecurringJob(job, customer.getId());
            
            return ResponseEntity.ok(Map.of(
                "message", "Recurring job created successfully",
                "job", createdJob
            ));
            
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(Map.of("error", e.getMessage()));
        }
    }
    
    /**
     * Get recurring jobs for current customer
     */
    @GetMapping
    public ResponseEntity<?> getRecurringJobs(@RequestHeader("Authorization") String jwt) {
        try {
            Users customer = usersService.findByJwtToken(jwt);
            
            if (!"CUSTOMER".equals(customer.getRole().toString())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "Only customers can view recurring jobs"));
            }
            
            List<RecurringJob> jobs = recurringJobService.getRecurringJobsForCustomer(customer.getId());
            
            return ResponseEntity.ok(jobs);
            
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to fetch recurring jobs"));
        }
    }
    
    /**
     * Get active recurring jobs for current customer
     */
    @GetMapping("/active")
    public ResponseEntity<?> getActiveRecurringJobs(@RequestHeader("Authorization") String jwt) {
        try {
            Users customer = usersService.findByJwtToken(jwt);
            
            if (!"CUSTOMER".equals(customer.getRole().toString())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "Only customers can view recurring jobs"));
            }
            
            List<RecurringJob> jobs = recurringJobService.getActiveRecurringJobsForCustomer(customer.getId());
            
            return ResponseEntity.ok(jobs);
            
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to fetch active recurring jobs"));
        }
    }
    
    /**
     * Update a recurring job
     */
    @PutMapping("/{jobId}")
    public ResponseEntity<?> updateRecurringJob(
            @RequestHeader("Authorization") String jwt,
            @PathVariable Long jobId,
            @RequestBody RecurringJob updatedJob) {
        try {
            Users customer = usersService.findByJwtToken(jwt);
            
            if (!"CUSTOMER".equals(customer.getRole().toString())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "Only customers can update recurring jobs"));
            }
            
            RecurringJob job = recurringJobService.updateRecurringJob(jobId, updatedJob, customer.getId());
            
            return ResponseEntity.ok(Map.of(
                "message", "Recurring job updated successfully",
                "job", job
            ));
            
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(Map.of("error", e.getMessage()));
        }
    }
    
    /**
     * Delete a recurring job
     */
    @DeleteMapping("/{jobId}")
    public ResponseEntity<?> deleteRecurringJob(
            @RequestHeader("Authorization") String jwt,
            @PathVariable Long jobId) {
        try {
            Users customer = usersService.findByJwtToken(jwt);
            
            if (!"CUSTOMER".equals(customer.getRole().toString())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "Only customers can delete recurring jobs"));
            }
            
            recurringJobService.deleteRecurringJob(jobId, customer.getId());
            
            return ResponseEntity.ok(Map.of("message", "Recurring job deleted successfully"));
            
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(Map.of("error", e.getMessage()));
        }
    }
}