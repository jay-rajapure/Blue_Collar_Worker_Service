package com.byteminds.blue.colller.worker.service.service;

import com.byteminds.blue.colller.worker.service.Config.JwtProvider;
import com.byteminds.blue.colller.worker.service.Repository.UsersRepository;
import com.byteminds.blue.colller.worker.service.models.Users;
import com.byteminds.blue.colller.worker.service.request.WorkerProfileUpdateRequest;
import com.byteminds.blue.colller.worker.service.Response.WorkerProfileResponse;
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
    
    // ✅ Update worker profile
    public WorkerProfileResponse updateWorkerProfile(Long workerId, WorkerProfileUpdateRequest request) throws Exception {
        Optional<Users> userOpt = userRepository.findById(workerId);
        if (userOpt.isEmpty()) {
            throw new Exception("Worker not found");
        }
        
        Users worker = userOpt.get();
        
        // Update profile fields
        if (request.getBio() != null) {
            worker.setBio(request.getBio());
        }
        if (request.getSkills() != null) {
            worker.setSkills(request.getSkills());
        }
        if (request.getCertifications() != null) {
            worker.setCertifications(request.getCertifications());
        }
        if (request.getExperienceYears() != null) {
            worker.setExperienceYears(request.getExperienceYears());
        }
        if (request.getIsAvailable() != null) {
            worker.setIsAvailable(request.getIsAvailable());
        }
        if (request.getLatitude() != null) {
            worker.setLatitude(request.getLatitude());
        }
        if (request.getLongitude() != null) {
            worker.setLongitude(request.getLongitude());
        }
        if (request.getCity() != null) {
            worker.setCity(request.getCity());
        }
        if (request.getAddress() != null) {
            worker.setAddress(request.getAddress());
        }
        
        Users updatedWorker = userRepository.save(worker);
        return convertToWorkerProfileResponse(updatedWorker);
    }
    
    // ✅ Get worker profile
    public WorkerProfileResponse getWorkerProfile(Long workerId) throws Exception {
        Optional<Users> userOpt = userRepository.findById(workerId);
        if (userOpt.isEmpty()) {
            throw new Exception("Worker not found");
        }
        
        return convertToWorkerProfileResponse(userOpt.get());
    }
    
    // Convert Users entity to WorkerProfileResponse
    private WorkerProfileResponse convertToWorkerProfileResponse(Users user) {
        WorkerProfileResponse response = new WorkerProfileResponse();
        response.setId(user.getId());
        response.setName(user.getName());
        response.setEmail(user.getEmail());
        response.setPhone(user.getPhone());
        response.setCity(user.getCity());
        response.setAddress(user.getAddress());
        response.setRating(user.getRating());
        response.setTotalRatings(user.getTotalRatings());
        response.setExperienceYears(user.getExperienceYears());
        response.setBio(user.getBio());
        response.setSkills(user.getSkills());
        response.setCertifications(user.getCertifications());
        response.setIsAvailable(user.getIsAvailable());
        response.setLatitude(user.getLatitude());
        response.setLongitude(user.getLongitude());
        response.setCreatedAt(user.getCreatedAt());
        response.setUpdatedAt(user.getUpdatedAt());
        return response;
    }
}
