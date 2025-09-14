package com.byteminds.blue.colller.worker.service.service;

import com.byteminds.blue.colller.worker.service.Config.JwtProvider;
import com.byteminds.blue.colller.worker.service.Repository.UsersRepository;
import com.byteminds.blue.colller.worker.service.models.Users;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class UsersService {

    @Autowired
    private  UsersRepository userRepository;
    @Autowired
    private JwtProvider jwtProvider;

    public Users findByJwtToken(String jwt)
    {
        String email = jwtProvider.getemailfromjwttoken(jwt);
        Users users = userRepository.findByEmail(email).orElseThrow(()->new UsernameNotFoundException("Invalid jwt token : email not found "));
        return users;
    }
    public Users findUserByEmail(String email) throws Exception
    {
        Users users =userRepository.findByEmail(email).orElseThrow(()->new UsernameNotFoundException(" Email not found "));
        if(users == null){
            throw new Exception("User Not Found");
        }
        return  users;
    }

    // constructor injection (recommended)


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
