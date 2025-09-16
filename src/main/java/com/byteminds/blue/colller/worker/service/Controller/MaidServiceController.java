package com.byteminds.blue.colller.worker.service.Controller;

import com.byteminds.blue.colller.worker.service.Repository.MaidServiceRepository;
import com.byteminds.blue.colller.worker.service.dto.MaidServiceDTO;
import com.byteminds.blue.colller.worker.service.models.MaidService;
import com.byteminds.blue.colller.worker.service.models.Users;
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
@RequestMapping("/api/maid-services")
public class MaidServiceController {
    
    @Autowired
    private MaidServiceRepository maidServiceRepository;
    
    @Autowired
    private UsersService usersService;
    
    // Worker adds a maid service
    @PostMapping("/worker")
    public ResponseEntity<?> addMaidService(
            @RequestHeader("Authorization") String jwt,
            @RequestBody MaidServiceDTO maidServiceDTO) {
        try {
            Users worker = usersService.findByJwtToken(jwt);
            
            // Validate worker role
            if (!"WORKER".equals(worker.getRole().toString())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "Only workers can add maid services"));
            }
            
            // Create maid service
            MaidService maidService = new MaidService();
            maidService.setServiceName(maidServiceDTO.getServiceName());
            maidService.setDescription(maidServiceDTO.getDescription());
            maidService.setServiceType(maidServiceDTO.getServiceType());
            maidService.setDailyRate(maidServiceDTO.getDailyRate());
            maidService.setMonthlyRate(maidServiceDTO.getMonthlyRate());
            maidService.setIsAvailable(maidServiceDTO.getIsAvailable() != null ? maidServiceDTO.getIsAvailable() : true);
            maidService.setWorker(worker);
            
            MaidService savedService = maidServiceRepository.save(maidService);
            
            return ResponseEntity.ok(Map.of(
                "message", "Maid service added successfully",
                "serviceId", savedService.getId()
            ));
            
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to add maid service", "message", e.getMessage()));
        }
    }
    
    // Get all available maid services for customers
    @GetMapping("/customer")
    public ResponseEntity<?> getAvailableMaidServices() {
        try {
            List<MaidService> services = maidServiceRepository.findAvailableServicesOrderByCreatedAt();
            List<Map<String, Object>> responseList = services.stream()
                .map(this::convertToResponseMap)
                .collect(Collectors.toList());
            
            return ResponseEntity.ok(responseList);
            
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to fetch maid services"));
        }
    }
    
    // Get maid services by specific worker
    @GetMapping("/worker/{workerId}")
    public ResponseEntity<?> getMaidServicesByWorker(@PathVariable Long workerId) {
        try {
            List<MaidService> services = maidServiceRepository.findAvailableServicesByWorker(workerId);
            List<Map<String, Object>> responseList = services.stream()
                .map(this::convertToResponseMap)
                .collect(Collectors.toList());
            
            return ResponseEntity.ok(responseList);
            
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to fetch maid services"));
        }
    }
    
    // Get maid services by service type
    @GetMapping("/type/{serviceType}")
    public ResponseEntity<?> getMaidServicesByType(@PathVariable String serviceType) {
        try {
            List<MaidService> services = maidServiceRepository.findByServiceType(serviceType);
            List<Map<String, Object>> responseList = services.stream()
                .map(this::convertToResponseMap)
                .collect(Collectors.toList());
            
            return ResponseEntity.ok(responseList);
            
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to fetch maid services"));
        }
    }
    
    // Worker updates their maid service
    @PutMapping("/{serviceId}")
    public ResponseEntity<?> updateMaidService(
            @PathVariable Long serviceId,
            @RequestHeader("Authorization") String jwt,
            @RequestBody MaidServiceDTO maidServiceDTO) {
        try {
            Users worker = usersService.findByJwtToken(jwt);
            
            if (!"WORKER".equals(worker.getRole().toString())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "Only workers can update maid services"));
            }
            
            MaidService maidService = maidServiceRepository.findById(serviceId)
                .orElseThrow(() -> new RuntimeException("Maid service not found"));
            
            // Check if worker owns this service
            if (!maidService.getWorker().getId().equals(worker.getId())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "You can only update your own services"));
            }
            
            // Update service
            maidService.setServiceName(maidServiceDTO.getServiceName());
            maidService.setDescription(maidServiceDTO.getDescription());
            maidService.setDailyRate(maidServiceDTO.getDailyRate());
            maidService.setMonthlyRate(maidServiceDTO.getMonthlyRate());
            maidService.setIsAvailable(maidServiceDTO.getIsAvailable() != null ? maidServiceDTO.getIsAvailable() : true);
            
            MaidService updatedService = maidServiceRepository.save(maidService);
            
            return ResponseEntity.ok(Map.of(
                "message", "Maid service updated successfully",
                "serviceId", updatedService.getId()
            ));
            
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to update maid service", "message", e.getMessage()));
        }
    }
    
    // Worker deletes their maid service
    @DeleteMapping("/{serviceId}")
    public ResponseEntity<?> deleteMaidService(
            @PathVariable Long serviceId,
            @RequestHeader("Authorization") String jwt) {
        try {
            Users worker = usersService.findByJwtToken(jwt);
            
            if (!"WORKER".equals(worker.getRole().toString())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "Only workers can delete maid services"));
            }
            
            MaidService maidService = maidServiceRepository.findById(serviceId)
                .orElseThrow(() -> new RuntimeException("Maid service not found"));
            
            // Check if worker owns this service
            if (!maidService.getWorker().getId().equals(worker.getId())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "You can only delete your own services"));
            }
            
            maidServiceRepository.delete(maidService);
            
            return ResponseEntity.ok(Map.of("message", "Maid service deleted successfully"));
            
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to delete maid service", "message", e.getMessage()));
        }
    }
    
    private Map<String, Object> convertToResponseMap(MaidService service) {
        Map<String, Object> responseMap = new HashMap<>();
        responseMap.put("id", service.getId());
        responseMap.put("serviceName", service.getServiceName());
        responseMap.put("description", service.getDescription() != null ? service.getDescription() : "");
        responseMap.put("serviceType", service.getServiceType() != null ? service.getServiceType() : "");
        responseMap.put("dailyRate", service.getDailyRate() != null ? service.getDailyRate() : 0);
        responseMap.put("monthlyRate", service.getMonthlyRate() != null ? service.getMonthlyRate() : 0);
        responseMap.put("isAvailable", service.getIsAvailable());
        responseMap.put("workerName", service.getWorker().getName());
        responseMap.put("workerEmail", service.getWorker().getEmail());
        responseMap.put("workerId", service.getWorker().getId());
        return responseMap;
    }
}