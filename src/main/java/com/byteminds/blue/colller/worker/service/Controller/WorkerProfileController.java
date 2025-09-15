package com.byteminds.blue.colller.worker.service.Controller;

import com.byteminds.blue.colller.worker.service.Response.WorkerProfileResponse;
import com.byteminds.blue.colller.worker.service.models.Users;
import com.byteminds.blue.colller.worker.service.request.WorkerProfileUpdateRequest;
import com.byteminds.blue.colller.worker.service.service.UsersService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/worker-profile")
public class WorkerProfileController {
    
    @Autowired
    private UsersService usersService;
    
    // Get worker profile by ID (for customers to view assigned worker)
    @GetMapping("/{workerId}")
    public ResponseEntity<WorkerProfileResponse> getWorkerProfile(@PathVariable Long workerId) {
        try {
            WorkerProfileResponse profile = usersService.getWorkerProfile(workerId);
            return ResponseEntity.ok(profile);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    // Get current worker's own profile
    @GetMapping("/my-profile")
    public ResponseEntity<WorkerProfileResponse> getMyProfile(
            @RequestHeader("Authorization") String jwt) {
        try {
            Users worker = usersService.findByJwtToken(jwt);
            if (!"WORKER".equals(worker.getRole().toString())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }
            
            WorkerProfileResponse profile = usersService.getWorkerProfile(worker.getId());
            return ResponseEntity.ok(profile);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    // Update worker profile
    @PutMapping("/update")
    public ResponseEntity<WorkerProfileResponse> updateWorkerProfile(
            @RequestHeader("Authorization") String jwt,
            @RequestBody WorkerProfileUpdateRequest request) {
        try {
            Users worker = usersService.findByJwtToken(jwt);
            if (!"WORKER".equals(worker.getRole().toString())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }
            
            WorkerProfileResponse updatedProfile = usersService.updateWorkerProfile(worker.getId(), request);
            return ResponseEntity.ok(updatedProfile);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
}