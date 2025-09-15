package com.byteminds.blue.colller.worker.service.service;

import com.byteminds.blue.colller.worker.service.Repository.UsersRepository;
import com.byteminds.blue.colller.worker.service.models.Role;
import com.byteminds.blue.colller.worker.service.models.Users;
import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class CustomerUserDetailService implements UserDetailsService {
    @Autowired
    private UsersRepository usersRepository;

    private Role userRole;

    private Users users;
    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        try {
            System.out.println("Loading user details for: " + username);
            
            Users user = usersRepository.findByEmail(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + username));
            
            System.out.println("User found: " + user.getName() + " with email: " + user.getEmail());
            
            // Validate required fields
            String email = user.getEmail();
            String password = user.getPasswordHash();
            Role role = user.getRole();
            
            if (email == null || email.trim().isEmpty()) {
                System.out.println("Error: User email is null or empty");
                throw new UsernameNotFoundException("User email cannot be null or empty");
            }
            
            if (password == null || password.trim().isEmpty()) {
                System.out.println("Error: User password is null or empty");
                throw new UsernameNotFoundException("User password cannot be null or empty");
            }
            
            if (role == null) {
                System.out.println("Warning: User role is null, defaulting to CUSTOMER");
                role = Role.CUSTOMER;
            }
            
            System.out.println("Creating UserDetails with email: " + email + ", role: " + role);
            
            List<GrantedAuthority> authorities = new ArrayList<>();
            authorities.add(new SimpleGrantedAuthority(role.toString()));
            
            return new User(email, password, authorities);
            
        } catch (Exception e) {
            System.out.println("Error in loadUserByUsername: " + e.getMessage());
            e.printStackTrace();
            throw new UsernameNotFoundException("Failed to load user: " + username, e);
        }
    }
}
