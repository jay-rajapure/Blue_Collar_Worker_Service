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
public class CustomerUserDetailService {
    @Autowired
    private UsersRepository usersRepository;

    private Role userRole;

    private Users users;
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException
    {
        Users user = usersRepository.findByEmail(username).orElseThrow(()->new UsernameNotFoundException("user not found with this email"));

        Role role = user.getRole();
//        if(role == null)
//        {
//            role = User_Role.ROLE_CUSTOMER;
//        }
        List<GrantedAuthority> authorioty = new ArrayList<>();
        authorioty.add(new SimpleGrantedAuthority(role.toString()));

        return new User(user.getEmail(),user.getPasswordHash(),authorioty);
    }
}
