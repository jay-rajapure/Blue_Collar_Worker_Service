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
        AuthResponse authResponse =new AuthResponse();
        authResponse.setJwt(jwt);
        authResponse.setMessage("Register Success");
        authResponse.setRole(savedUser.getRole());

        return new ResponseEntity<>(authResponse, HttpStatus.CREATED);
    }

    @PostMapping("/signIn")
    public ResponseEntity<AuthResponse>signin(@RequestBody LogInRequest req)
    {
        String username = req.getEmail();
        String password = req.getPassword();

        Authentication authentication = authenticate(username,password);

        Collection< ? extends GrantedAuthority>authorities=authentication.getAuthorities();
        String role = authorities.isEmpty()?null:authorities.iterator().next().getAuthority();

        String jwt=jwtProvider.generateToken(authentication);

        AuthResponse authResponse =new AuthResponse();
        authResponse.setJwt(jwt);
        authResponse.setMessage("Login Success");
        authResponse.setRole(Role.valueOf(role));

        return new ResponseEntity<>(authResponse, HttpStatus.OK);
    }

    private Authentication authenticate(String username, String password) {
        UserDetails userDetails =customerUserDetailService.loadUserByUsername(username);
        if(userDetails == null)
        {
            throw new BadCredentialsException("Invalid Username");
        }
        if(!passwordEncoder.matches(password,userDetails.getPassword()))
        {
            throw new BadCredentialsException("Invalid Password ");
        }
        return new UsernamePasswordAuthenticationToken(userDetails,null,userDetails.getAuthorities());
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