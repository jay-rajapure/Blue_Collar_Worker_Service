package com.byteminds.blue.colller.worker.service.service;

import com.byteminds.blue.colller.worker.service.Repository.UsersRepository;
import com.byteminds.blue.colller.worker.service.models.Users;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class UsersService {

    private final UsersRepository userRepository;

    // constructor injection (recommended)
    public UsersService(UsersRepository userRepository) {
        this.userRepository = userRepository;
    }

    // ✅ Create or Update User
    public Users saveUser(Users user) {
        return userRepository.save(user);
    }

    // ✅ Get all users
    public List<Users> getAllUsers() {
        return userRepository.findAll();
    }

    // ✅ Get user by ID
    public Optional<Users> getUserById(Long id) {
        return userRepository.findById(id);
    }

    // ✅ Get user by Email
    public Optional<Users> getUserByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    // ✅ Delete user
    public void deleteUser(Long id) {
        userRepository.deleteById(id);
    }
}
