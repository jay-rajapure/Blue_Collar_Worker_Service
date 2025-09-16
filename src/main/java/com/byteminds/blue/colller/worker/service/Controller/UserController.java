
@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*")
public class UserController {
    
    @Autowired
    private UsersService usersService;
    
    
    // Update worker availability status
    @PutMapping("/update-availability")
    public ResponseEntity<?> updateAvailability(
            @RequestHeader("Authorization") String jwt,
            @RequestBody Map<String, Boolean> payload) {
        try {
            Users user = usersService.findByJwtToken(jwt);
            
            Boolean isAvailable = payload.get("isAvailable");
            if (isAvailable == null) {
                return ResponseEntity.badRequest()
                    .body(Map.of("error", "isAvailable field is required"));
            }
            
            user.setIsAvailable(isAvailable);
            Users updatedUser = usersService.updateUser(user);
            
            return ResponseEntity.ok(Map.of(
                "message", "Availability updated successfully",
                "isAvailable", isAvailable
            ));
            
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to update availability"));
        }
    }
    
    // Get worker stats
    @GetMapping("/worker-stats")
    public ResponseEntity<?> getWorkerStats(@RequestHeader("Authorization") String jwt) {
        try {
            Users worker = usersService.findByJwtToken(jwt);
            
            if (!"WORKER".equals(worker.getRole().toString())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "Only workers can access this endpoint"));
            }
            
            // In a real implementation, this would fetch actual stats from the database
            Map<String, Object> stats = Map.of(
                "totalBookings", 15,
                "completedBookings", 12,
                "pendingBookings", 3,
                "averageRating", 4.8,
                "totalEarnings", 15000.0,
                "isAvailable", worker.getIsAvailable() != null ? worker.getIsAvailable() : true
            );
            
            return ResponseEntity.ok(stats);
            
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to fetch worker stats"));
        }
    }
}