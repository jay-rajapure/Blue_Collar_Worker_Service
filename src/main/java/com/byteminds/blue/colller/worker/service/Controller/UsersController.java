package com.byteminds.blue.colller.worker.service.Controller;
import com.byteminds.blue.colller.worker.service.Response.AuthResponse;
import com.byteminds.blue.colller.worker.service.models.Role;
import com.byteminds.blue.colller.worker.service.request.LogInRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.net.http.HttpResponse;
import java.util.Collection;


import com.byteminds.blue.colller.worker.service.Config.JwtProvider;
import com.byteminds.blue.colller.worker.service.Repository.UsersRepository;
import com.byteminds.blue.colller.worker.service.models.Users;
import com.byteminds.blue.colller.worker.service.service.CustomerUserDetailService;
import com.byteminds.blue.colller.worker.service.service.UsersService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;


import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/auth")  // Base path for all user APIs
public class UsersController {
    @Autowired
    private  UsersService userService;
    @Autowired
    private JwtProvider jwtProvider;
    @Autowired
    private CustomerUserDetailService customerUserDetailService;
    @Autowired
    private  UsersRepository usersRepository;
    @Autowired
    private PasswordEncoder passwordEncoder;
    // ✅ Create a new user
    @PostMapping("/signUp")
    public ResponseEntity<AuthResponse> createUser(@RequestBody Users users) throws Exception {
        Optional<Users> isEmailExist =usersRepository.findByEmail(users.getEmail());
        if(isEmailExist.isPresent())
        {
            throw new Exception("Email Already Used with another account ");
        }

        Users createdUser = new Users();
        createdUser.setEmail(users.getEmail());
        createdUser.setName(users.getName());
        createdUser.setRole(users.getRole());
        createdUser.setPasswordHash(passwordEncoder.encode(users.getPasswordHash()));
        Users savedUser = usersRepository.save(createdUser);

        Authentication authentication =new UsernamePasswordAuthenticationToken(users.getEmail(),users.getPasswordHash());
        SecurityContextHolder.getContext().setAuthentication(authentication);

        String jwt=jwtProvider.generateToken(authentication);
        AuthResponse authResponse = new AuthResponse();
        authResponse.setJwt(jwt);
        authResponse.setMessage("Register Success");
        authResponse.setRole(savedUser.getRole());
        
        // Add user details for registration response
        authResponse.setUserId(savedUser.getId());
        authResponse.setUserName(savedUser.getName());
        authResponse.setUserEmail(savedUser.getEmail());
        
        // Set role-specific dashboard URLs for new users
        if (Role.WORKER.equals(savedUser.getRole())) {
            authResponse.setDashboardUrl("worker-dashboard.html");
            authResponse.setWelcomeMessage("Registration successful! Welcome to your worker dashboard.");
        } else if (Role.CUSTOMER.equals(savedUser.getRole())) {
            authResponse.setDashboardUrl("services.html?view=customer");
            authResponse.setWelcomeMessage("Registration successful! Start browsing services.");
        } else {
            authResponse.setDashboardUrl("services.html");
            authResponse.setWelcomeMessage("Registration successful! Welcome to ServiceHub.");
        }

        return new ResponseEntity<>(authResponse, HttpStatus.CREATED);
    }

    @PostMapping("/signIn")
    public ResponseEntity<AuthResponse> signin(@RequestBody LogInRequest req) {
        try {
            System.out.println("Login attempt for email: " + req.getEmail());
            
            String username = req.getEmail();
            String password = req.getPassword();

            if (username == null || username.trim().isEmpty()) {
                System.out.println("Login failed: Email is null or empty");
                AuthResponse errorResponse = new AuthResponse();
                errorResponse.setMessage("Email is required");
                return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST);
            }

            if (password == null || password.trim().isEmpty()) {
                System.out.println("Login failed: Password is null or empty");
                AuthResponse errorResponse = new AuthResponse();
                errorResponse.setMessage("Password is required");
                return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST);
            }

            Authentication authentication = authenticate(username, password);
            System.out.println("Authentication successful for: " + username);

            Collection<? extends GrantedAuthority> authorities = authentication.getAuthorities();
            String role = authorities.isEmpty() ? null : authorities.iterator().next().getAuthority();
            System.out.println("User role: " + role);

            String jwt = jwtProvider.generateToken(authentication);
            System.out.println("JWT token generated successfully");

            // Get user details for enhanced response
            Users user = usersRepository.findByEmail(username).orElse(null);
            
            AuthResponse authResponse = new AuthResponse();
            authResponse.setJwt(jwt);
            authResponse.setMessage("Login Success");
            authResponse.setRole(Role.valueOf(role));
            
            // Add user details and role-specific information
            if (user != null) {
                authResponse.setUserId(user.getId());
                authResponse.setUserName(user.getName());
                authResponse.setUserEmail(user.getEmail());
                
                // Set role-specific dashboard URLs
                if (Role.WORKER.equals(user.getRole())) {
                    authResponse.setDashboardUrl("worker-dashboard.html");
                    authResponse.setWelcomeMessage("Welcome back! Ready to manage your services?");
                } else if (Role.CUSTOMER.equals(user.getRole())) {
                    authResponse.setDashboardUrl("services.html?view=customer");
                    authResponse.setWelcomeMessage("Welcome! Find the perfect service for your needs.");
                } else {
                    authResponse.setDashboardUrl("services.html");
                    authResponse.setWelcomeMessage("Welcome to ServiceHub!");
                }
            }

            return new ResponseEntity<>(authResponse, HttpStatus.OK);
            
        } catch (BadCredentialsException e) {
            System.out.println("Login failed: Bad credentials - " + e.getMessage());
            AuthResponse errorResponse = new AuthResponse();
            errorResponse.setMessage("Invalid email or password");
            return new ResponseEntity<>(errorResponse, HttpStatus.UNAUTHORIZED);
            
        } catch (UsernameNotFoundException e) {
            System.out.println("Login failed: User not found - " + e.getMessage());
            AuthResponse errorResponse = new AuthResponse();
            errorResponse.setMessage("User not found");
            return new ResponseEntity<>(errorResponse, HttpStatus.UNAUTHORIZED);
            
        } catch (Exception e) {
            System.out.println("Login failed: Unexpected error - " + e.getMessage());
            e.printStackTrace();
            AuthResponse errorResponse = new AuthResponse();
            errorResponse.setMessage("Login failed due to server error");
            return new ResponseEntity<>(errorResponse, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    private Authentication authenticate(String username, String password) {
        try {
            System.out.println("Attempting to authenticate user: " + username);
            
            UserDetails userDetails = customerUserDetailService.loadUserByUsername(username);
            if (userDetails == null) {
                System.out.println("Authentication failed: User details not found for " + username);
                throw new BadCredentialsException("Invalid Username");
            }
            
            System.out.println("User details loaded successfully for: " + username);
            
            if (!passwordEncoder.matches(password, userDetails.getPassword())) {
                System.out.println("Authentication failed: Password mismatch for " + username);
                throw new BadCredentialsException("Invalid Password");
            }
            
            System.out.println("Password verification successful for: " + username);
            
            return new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
            
        } catch (UsernameNotFoundException e) {
            System.out.println("Authentication failed: Username not found - " + e.getMessage());
            throw new BadCredentialsException("Invalid Username");
        } catch (Exception e) {
            System.out.println("Authentication failed: Unexpected error - " + e.getMessage());
            e.printStackTrace();
            throw new BadCredentialsException("Authentication failed");
        }
    }

    // ✅ Get all users
    @GetMapping("/")
    public ResponseEntity<List<Users>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    // ✅ Get user by ID
    @GetMapping("/{id}")
    public ResponseEntity<Users> getUserById(@PathVariable Long id) {
        return userService.getUserById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // ✅ Get user by Email
    @GetMapping("/email/{email}")
    public ResponseEntity<Users> getUserByEmail(@PathVariable String email) {
        return userService.getUserByEmail(email)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // ✅ Update user
    @PutMapping("/{id}")
    public ResponseEntity<Users> updateUser(@PathVariable Long id, @RequestBody Users userDetails) {
        return userService.getUserById(id)
                .map(existingUser -> {
                    existingUser.setName(userDetails.getName());
                    existingUser.setEmail(userDetails.getEmail());
                    existingUser.setRole(userDetails.getRole());
                    Users updatedUser = userService.saveUser(existingUser);
                    return ResponseEntity.ok(updatedUser);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // ✅ Delete user
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }
}