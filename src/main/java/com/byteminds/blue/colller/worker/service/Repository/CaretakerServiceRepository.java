package com.byteminds.blue.colller.worker.service.Repository;

import com.byteminds.blue.colller.worker.service.models.CaretakerService;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CaretakerServiceRepository extends JpaRepository<CaretakerService, Long> {
    
    // Find all available caretaker services
    @Query("SELECT cs FROM CaretakerService cs WHERE cs.isAvailable = true")
    List<CaretakerService> findAllAvailable();
    
    // Find caretaker services by worker ID
    List<CaretakerService> findByWorkerId(Long workerId);
    
    // Find caretaker services by service type
    List<CaretakerService> findByServiceType(String serviceType);
    
    // Find available caretaker services by service type
    @Query("SELECT cs FROM CaretakerService cs WHERE cs.isAvailable = true AND cs.serviceType = :serviceType")
    List<CaretakerService> findAvailableByServiceType(@Param("serviceType") String serviceType);
    
    // Find caretaker service by ID and worker ID
    @Query("SELECT cs FROM CaretakerService cs WHERE cs.id = :id AND cs.worker.id = :workerId")
    Optional<CaretakerService> findByIdAndWorkerId(@Param("id") Long id, @Param("workerId") Long workerId);
}