package com.byteminds.blue.colller.worker.service.Repository;

import com.byteminds.blue.colller.worker.service.models.Work;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface WorkRepository extends JpaRepository<Work,Long> {
    
    // Find all available works (for customers to browse)
    @Query("SELECT w FROM Work w WHERE w.isAvailable = true")
    List<Work> findByIsAvailableTrue();
    
    // Find works by worker ID (for workers to manage their services)
    List<Work> findByWorker_Id(Long workerId);
    
    // Find available works excluding a specific worker (for work opportunities)
    @Query("SELECT w FROM Work w WHERE w.isAvailable = true AND w.worker.id != :workerId")
    List<Work> findByIsAvailableTrueAndWorker_IdNot(@Param("workerId") Long workerId);

}
