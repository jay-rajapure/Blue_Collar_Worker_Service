package com.byteminds.blue.colller.worker.service.Controller;

import com.byteminds.blue.colller.worker.service.Repository.CaretakerServiceRepository;
import com.byteminds.blue.colller.worker.service.Repository.UsersRepository;
import com.byteminds.blue.colller.worker.service.dto.CaretakerServiceDTO;
import com.byteminds.blue.colller.worker.service.models.CaretakerService;
import com.byteminds.blue.colller.worker.service.models.Users;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/caretaker-services")
@CrossOrigin(origins = "*")
public class CaretakerServiceController {
    
    @Autowired
    private CaretakerServiceRepository caretakerServiceRepository;
    
    @Autowired
    private UsersRepository usersRepository;
    
    // Add a new caretaker service (Worker only)
    @PostMapping("/worker")
    public ResponseEntity<?> addCaretakerService(@RequestBody CaretakerService caretakerService,
                                                @RequestHeader("Authorization") String token) {
        try {
            // Extract worker ID from token (simplified - in real implementation, validate JWT)
            // For now, we'll assume the worker ID is passed in the request or extracted from token
            // In a real implementation, you would validate the JWT token and extract user info
            
            // Validate required fields
            if (caretakerService.getServiceName() == null || caretakerService.getServiceName().isEmpty()) {
                return ResponseEntity.badRequest().body("Service name is required");
            }
            
            if (caretakerService.getWorker() == null || caretakerService.getWorker().getId() == null) {
                return ResponseEntity.badRequest().body("Worker ID is required");
            }
            
            // Check if worker exists
            Optional<Users> workerOpt = usersRepository.findById(caretakerService.getWorker().getId());
            if (!workerOpt.isPresent()) {
                return ResponseEntity.badRequest().body("Worker not found");
            }
            
            Users worker = workerOpt.get();
            caretakerService.setWorker(worker);
            
            // Save the caretaker service
            CaretakerService savedService = caretakerServiceRepository.save(caretakerService);
            
            return ResponseEntity.ok(savedService);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Error adding caretaker service: " + e.getMessage());
        }
    }
    
    // Get all available caretaker services for customers
    @GetMapping("/customer")
    public ResponseEntity<?> getAllAvailableCaretakerServices() {
        try {
            List<CaretakerService> services = caretakerServiceRepository.findAllAvailable();
            
            // Convert to DTOs
            List<CaretakerServiceDTO> serviceDTOs = services.stream().map(service -> {
                Users worker = service.getWorker();
                return new CaretakerServiceDTO(
                    service.getId(),
                    service.getServiceName(),
                    service.getDescription(),
                    service.getServiceType(),
                    service.getHourlyRate(),
                    service.getDailyRate(),
                    service.getMonthlyRate(),
                    service.getIsAvailable(),
                    service.getCreatedAt(),
                    service.getUpdatedAt(),
                    worker.getId(),
                    worker.getName(),
                    worker.getEmail(),
                    worker.getPhone(),
                    worker.getProfileImage() != null ? java.util.Base64.getEncoder().encodeToString(worker.getProfileImage()) : null
                );
            }).collect(Collectors.toList());
            
            return ResponseEntity.ok(serviceDTOs);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Error fetching caretaker services: " + e.getMessage());
        }
    }
    
    // Get caretaker services by worker ID
    @GetMapping("/worker/{workerId}")
    public ResponseEntity<?> getCaretakerServicesByWorker(@PathVariable Long workerId) {
        try {
            List<CaretakerService> services = caretakerServiceRepository.findByWorkerId(workerId);
            
            // Convert to DTOs
            List<CaretakerServiceDTO> serviceDTOs = services.stream().map(service -> {
                Users worker = service.getWorker();
                return new CaretakerServiceDTO(
                    service.getId(),
                    service.getServiceName(),
                    service.getDescription(),
                    service.getServiceType(),
                    service.getHourlyRate(),
                    service.getDailyRate(),
                    service.getMonthlyRate(),
                    service.getIsAvailable(),
                    service.getCreatedAt(),
                    service.getUpdatedAt(),
                    worker.getId(),
                    worker.getName(),
                    worker.getEmail(),
                    worker.getPhone(),
                    worker.getProfileImage() != null ? java.util.Base64.getEncoder().encodeToString(worker.getProfileImage()) : null
                );
            }).collect(Collectors.toList());
            
            return ResponseEntity.ok(serviceDTOs);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Error fetching caretaker services: " + e.getMessage());
        }
    }
    
    // Update caretaker service (Worker only)
    @PutMapping("/worker/{serviceId}")
    public ResponseEntity<?> updateCaretakerService(@PathVariable Long serviceId,
                                                   @RequestBody CaretakerService updatedService,
                                                   @RequestHeader("Authorization") String token) {
        try {
            // Extract worker ID from token (simplified)
            // In a real implementation, validate JWT and extract user info
            
            // Check if service exists
            Optional<CaretakerService> serviceOpt = caretakerServiceRepository.findById(serviceId);
            if (!serviceOpt.isPresent()) {
                return ResponseEntity.notFound().build();
            }
            
            CaretakerService existingService = serviceOpt.get();
            
            // Update fields
            if (updatedService.getServiceName() != null) {
                existingService.setServiceName(updatedService.getServiceName());
            }
            if (updatedService.getDescription() != null) {
                existingService.setDescription(updatedService.getDescription());
            }
            if (updatedService.getServiceType() != null) {
                existingService.setServiceType(updatedService.getServiceType());
            }
            if (updatedService.getHourlyRate() != null) {
                existingService.setHourlyRate(updatedService.getHourlyRate());
            }
            if (updatedService.getDailyRate() != null) {
                existingService.setDailyRate(updatedService.getDailyRate());
            }
            if (updatedService.getMonthlyRate() != null) {
                existingService.setMonthlyRate(updatedService.getMonthlyRate());
            }
            if (updatedService.getIsAvailable() != null) {
                existingService.setIsAvailable(updatedService.getIsAvailable());
            }
            
            // Save updated service
            CaretakerService savedService = caretakerServiceRepository.save(existingService);
            
            return ResponseEntity.ok(savedService);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Error updating caretaker service: " + e.getMessage());
        }
    }
    
    // Delete caretaker service (Worker only)
    @DeleteMapping("/worker/{serviceId}")
    public ResponseEntity<?> deleteCaretakerService(@PathVariable Long serviceId,
                                                   @RequestHeader("Authorization") String token) {
        try {
            // Extract worker ID from token (simplified)
            // In a real implementation, validate JWT and extract user info
            
            // Check if service exists
            Optional<CaretakerService> serviceOpt = caretakerServiceRepository.findById(serviceId);
            if (!serviceOpt.isPresent()) {
                return ResponseEntity.notFound().build();
            }
            
            caretakerServiceRepository.deleteById(serviceId);
            
            return ResponseEntity.ok().body("Caretaker service deleted successfully");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Error deleting caretaker service: " + e.getMessage());
        }
    }
}