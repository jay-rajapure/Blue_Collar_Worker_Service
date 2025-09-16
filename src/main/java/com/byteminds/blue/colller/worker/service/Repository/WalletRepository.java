package com.byteminds.blue.colller.worker.service.Repository;

import com.byteminds.blue.colller.worker.service.models.Wallet;
import com.byteminds.blue.colller.worker.service.models.Users;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface WalletRepository extends JpaRepository<Wallet, Long> {
    
    // Find wallet by user ID
    Optional<Wallet> findByUserId(Long userId);
    
    // Find wallet by user
    Optional<Wallet> findByUser(Users user);
}