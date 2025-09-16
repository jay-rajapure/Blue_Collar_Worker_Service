package com.byteminds.blue.colller.worker.service.Controller;

import com.byteminds.blue.colller.worker.service.Repository.WorkRequestRepository;
import com.byteminds.blue.colller.worker.service.dto.WorkRequestDTO;
import com.byteminds.blue.colller.worker.service.models.Users;
import com.byteminds.blue.colller.worker.service.models.WorkRequest;
import com.byteminds.blue.colller.worker.service.models.WorkRequestStatus;
import com.byteminds.blue.colller.worker.service.service.UsersService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/work-requests")
public class WorkRequestController {
    
    @Autowired
    private WorkRequestRepository workRequestRepository;
    
    @Autowired
    private UsersService usersService;
    
    // Customer posts a work request
    @PostMapping("/customer")
    public ResponseEntity<?> createWorkRequest(
            @RequestHeader("Authorization") String jwt,
            @RequestBody WorkRequestDTO workRequestDTO) {
        try {
            Users customer = usersService.findByJwtToken(jwt);
            
            // Validate customer role
            if (!"CUSTOMER".equals(customer.getRole().toString())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "Only customers can post work requests"));
            }
            
            // Create work request
            WorkRequest workRequest = new WorkRequest();
            workRequest.setTitle(workRequestDTO.getTitle());
            workRequest.setDescription(workRequestDTO.getDescription());
            workRequest.setCategory(workRequestDTO.getCategory());
            workRequest.setLocation(workRequestDTO.getLocation());
            workRequest.setAddress(workRequestDTO.getAddress());
            workRequest.setLatitude(workRequestDTO.getLatitude());
            workRequest.setLongitude(workRequestDTO.getLongitude());
            workRequest.setBudgetMin(workRequestDTO.getBudgetMin());
            workRequest.setBudgetMax(workRequestDTO.getBudgetMax());
            workRequest.setPreferredDate(workRequestDTO.getPreferredDate());
            workRequest.setIsUrgent(workRequestDTO.getIsUrgent() != null ? workRequestDTO.getIsUrgent() : false);
            workRequest.setPhoneNumber(workRequestDTO.getPhoneNumber());
            workRequest.setCustomer(customer);
            workRequest.setStatus(WorkRequestStatus.OPEN);
            
            WorkRequest savedRequest = workRequestRepository.save(workRequest);
            
            return ResponseEntity.ok(Map.of(
                "message", "Work request posted successfully",
                "requestId", savedRequest.getId()
            ));
            
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to create work request", "message", e.getMessage()));
        }
    }
    
    // Get work requests for customers (their own requests)
    @GetMapping("/customer/my-requests")
    public ResponseEntity<?> getCustomerWorkRequests(@RequestHeader("Authorization") String jwt) {
        try {
            Users customer = usersService.findByJwtToken(jwt);
            
            if (!"CUSTOMER".equals(customer.getRole().toString())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "Only customers can view their work requests"));
            }
            
            List<WorkRequest> requests = workRequestRepository.findByCustomer(customer);
            List<Map<String, Object>> responseList = requests.stream()
                .map(this::convertToResponseMap)
                .collect(Collectors.toList());
            
            return ResponseEntity.ok(responseList);
            
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to fetch work requests"));
        }
    }
    
    // Get available work requests for workers
    @GetMapping("/worker/available")
    public ResponseEntity<?> getAvailableWorkRequests(
            @RequestHeader("Authorization") String jwt,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) Double latitude,
            @RequestParam(required = false) Double longitude,
            @RequestParam(defaultValue = "50") Double radius) {
        try {
            Users worker = usersService.findByJwtToken(jwt);
            
            if (!"WORKER".equals(worker.getRole().toString())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "Only workers can view available work requests"));
            }
            
            List<WorkRequest> requests;
            if (latitude != null && longitude != null) {
                requests = workRequestRepository.findOpenRequestsNearLocation(latitude, longitude, radius, category);
            } else if (category != null) {
                requests = workRequestRepository.findOpenRequestsByCategory(category);
            } else {
                requests = workRequestRepository.findByStatusOrderByCreatedAtDesc(WorkRequestStatus.OPEN);
            }
            
            List<Map<String, Object>> responseList = requests.stream()
                .map(this::convertToResponseMap)
                .collect(Collectors.toList());
            
            return ResponseEntity.ok(responseList);
            
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to fetch available work requests"));
        }
    }
    
    // Worker applies for a work request
    @PostMapping("/{requestId}/apply")
    public ResponseEntity<?> applyForWorkRequest(
            @PathVariable Long requestId,
            @RequestHeader("Authorization") String jwt) {
        try {
            Users worker = usersService.findByJwtToken(jwt);
            
            if (!"WORKER".equals(worker.getRole().toString())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "Only workers can apply for work requests"));
            }
            
            WorkRequest workRequest = workRequestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Work request not found"));
            
            if (workRequest.getStatus() != WorkRequestStatus.OPEN) {
                return ResponseEntity.badRequest()
                    .body(Map.of("error", "This work request is no longer available"));
            }
            
            // Assign worker and update status
            workRequest.setAssignedWorker(worker);
            workRequest.setStatus(WorkRequestStatus.IN_PROGRESS);
            workRequestRepository.save(workRequest);
            
            return ResponseEntity.ok(Map.of(
                "message", "Successfully applied for work request",
                "requestId", requestId
            ));
            
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to apply for work request", "message", e.getMessage()));
        }
    }
    
    // Update work request status
    @PatchMapping("/{requestId}/status")
    public ResponseEntity<?> updateWorkRequestStatus(
            @PathVariable Long requestId,
            @RequestHeader("Authorization") String jwt,
            @RequestBody Map<String, String> statusUpdate) {
        try {
            Users user = usersService.findByJwtToken(jwt);
            WorkRequest workRequest = workRequestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Work request not found"));
            
            // Check if user is authorized to update this request
            boolean isCustomer = "CUSTOMER".equals(user.getRole().toString()) && workRequest.getCustomer().getId().equals(user.getId());
            boolean isAssignedWorker = "WORKER".equals(user.getRole().toString()) && 
                workRequest.getAssignedWorker() != null && workRequest.getAssignedWorker().getId().equals(user.getId());
            
            if (!isCustomer && !isAssignedWorker) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "You are not authorized to update this work request"));
            }
            
            String newStatus = statusUpdate.get("status");
            WorkRequestStatus status = WorkRequestStatus.valueOf(newStatus.toUpperCase());
            workRequest.setStatus(status);
            workRequestRepository.save(workRequest);
            
            return ResponseEntity.ok(Map.of(
                "message", "Work request status updated successfully",
                "status", status.toString()
            ));
            
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to update work request status", "message", e.getMessage()));
        }
    }
    
    private Map<String, Object> convertToResponseMap(WorkRequest request) {
        Map<String, Object> responseMap = new HashMap<>();
        responseMap.put("id", request.getId());
        responseMap.put("title", request.getTitle());
        responseMap.put("description", request.getDescription() != null ? request.getDescription() : "");
        responseMap.put("category", request.getCategory());
        responseMap.put("location", request.getLocation());
        responseMap.put("address", request.getAddress());
        responseMap.put("latitude", request.getLatitude());
        responseMap.put("longitude", request.getLongitude());
        responseMap.put("budgetMin", request.getBudgetMin() != null ? request.getBudgetMin() : 0);
        responseMap.put("budgetMax", request.getBudgetMax() != null ? request.getBudgetMax() : 0);
        responseMap.put("preferredDate", request.getPreferredDate() != null ? request.getPreferredDate().toString() : "");
        responseMap.put("isUrgent", request.getIsUrgent());
        responseMap.put("phoneNumber", request.getPhoneNumber() != null ? request.getPhoneNumber() : "");
        responseMap.put("status", request.getStatus().toString());
        responseMap.put("customerName", request.getCustomer().getName());
        responseMap.put("customerEmail", request.getCustomer().getEmail());
        responseMap.put("assignedWorkerName", request.getAssignedWorker() != null ? request.getAssignedWorker().getName() : "");
        responseMap.put("createdAt", request.getCreatedAt().toString());
        responseMap.put("updatedAt", request.getUpdatedAt().toString());
        return responseMap;
    }
}