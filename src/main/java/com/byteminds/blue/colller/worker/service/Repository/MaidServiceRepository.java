package com.byteminds.blue.colller.worker.service.Repository;

import com.byteminds.blue.colller.worker.service.models.MaidService;
import com.byteminds.blue.colller.worker.service.models.Users;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MaidServiceRepository extends JpaRepository<MaidService, Long> {
    
    List<MaidService> findByWorker(Users worker);
    
    List<MaidService> findByIsAvailableTrue();
    
    List<MaidService> findByServiceNameContainingIgnoreCase(String serviceName);
    
    List<MaidService> findByServiceType(String serviceType);
    
    @Query("SELECT ms FROM MaidService ms WHERE ms.isAvailable = true ORDER BY ms.createdAt DESC")
    List<MaidService> findAvailableServicesOrderByCreatedAt();
    
    @Query("SELECT ms FROM MaidService ms WHERE ms.worker.id = :workerId AND ms.isAvailable = true")
    List<MaidService> findAvailableServicesByWorker(@Param("workerId") Long workerId);
}