package com.byteminds.blue.colller.worker.service.Controller;

import com.byteminds.blue.colller.worker.service.models.Users;
import com.byteminds.blue.colller.worker.service.models.Wallet;
import com.byteminds.blue.colller.worker.service.service.UsersService;
import com.byteminds.blue.colller.worker.service.service.WalletService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/wallet")
@CrossOrigin(origins = "*")
public class WalletController {
    
    @Autowired
    private WalletService walletService;
    
    @Autowired
    private UsersService usersService;
    
    /**
     * Get wallet for current user
     */
    @GetMapping
    public ResponseEntity<?> getWallet(@RequestHeader("Authorization") String jwt) {
        try {
            Users user = usersService.findByJwtToken(jwt);
            
            Optional<Wallet> walletOpt = walletService.getWalletByUserId(user.getId());
            if (walletOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "Wallet not found"));
            }
            
            return ResponseEntity.ok(walletOpt.get());
            
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to fetch wallet"));
        }
    }
    
    /**
     * Deposit money to wallet
     */
    @PostMapping("/deposit")
    public ResponseEntity<?> depositToWallet(
            @RequestHeader("Authorization") String jwt,
            @RequestParam Double amount,
            @RequestParam String description,
            @RequestParam String referenceId) {
        try {
            Users user = usersService.findByJwtToken(jwt);
            
            Optional<Wallet> walletOpt = walletService.getWalletByUserId(user.getId());
            if (walletOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "Wallet not found"));
            }
            
            Wallet wallet = walletService.depositToWallet(
                walletOpt.get().getId(), amount, description, referenceId);
            
            return ResponseEntity.ok(Map.of(
                "message", "Money deposited successfully",
                "wallet", wallet
            ));
            
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(Map.of("error", e.getMessage()));
        }
    }
    
    /**
     * Move money to escrow for booking
     */
    @PostMapping("/escrow/deposit")
    public ResponseEntity<?> moveToEscrow(
            @RequestHeader("Authorization") String jwt,
            @RequestParam Long bookingId,
            @RequestParam Double amount) {
        try {
            Users user = usersService.findByJwtToken(jwt);
            
            Optional<Wallet> walletOpt = walletService.getWalletByUserId(user.getId());
            if (walletOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "Wallet not found"));
            }
            
            Wallet wallet = walletService.moveMoneyToEscrow(
                walletOpt.get().getId(), bookingId, amount);
            
            return ResponseEntity.ok(Map.of(
                "message", "Money moved to escrow successfully",
                "wallet", wallet
            ));
            
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(Map.of("error", e.getMessage()));
        }
    }
    
    /**
     * Release money from escrow to worker
     */
    @PostMapping("/escrow/release")
    public ResponseEntity<?> releaseFromEscrow(
            @RequestHeader("Authorization") String jwt,
            @RequestParam Long bookingId,
            @RequestParam Double amount,
            @RequestParam Double commission) {
        try {
            Users user = usersService.findByJwtToken(jwt);
            
            Optional<Wallet> walletOpt = walletService.getWalletByUserId(user.getId());
            if (walletOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "Wallet not found"));
            }
            
            Wallet wallet = walletService.releaseMoneyFromEscrow(
                walletOpt.get().getId(), bookingId, amount, commission);
            
            return ResponseEntity.ok(Map.of(
                "message", "Money released from escrow successfully",
                "wallet", wallet
            ));
            
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(Map.of("error", e.getMessage()));
        }
    }
    
    /**
     * Refund money from escrow to customer
     */
    @PostMapping("/escrow/refund")
    public ResponseEntity<?> refundFromEscrow(
            @RequestHeader("Authorization") String jwt,
            @RequestParam Long bookingId,
            @RequestParam Double amount) {
        try {
            Users user = usersService.findByJwtToken(jwt);
            
            Optional<Wallet> walletOpt = walletService.getWalletByUserId(user.getId());
            if (walletOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "Wallet not found"));
            }
            
            Wallet wallet = walletService.refundMoneyFromEscrow(
                walletOpt.get().getId(), bookingId, amount);
            
            return ResponseEntity.ok(Map.of(
                "message", "Money refunded from escrow successfully",
                "wallet", wallet
            ));
            
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(Map.of("error", e.getMessage()));
        }
    }
}