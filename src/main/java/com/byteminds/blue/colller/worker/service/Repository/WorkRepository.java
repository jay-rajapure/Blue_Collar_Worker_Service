package com.byteminds.blue.colller.worker.service.Repository;

import com.byteminds.blue.colller.worker.service.models.Work;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface WorkRepository extends JpaRepository<Work,Long> {


}
