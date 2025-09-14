package com.byteminds.blue.colller.worker.service.Response;

import com.byteminds.blue.colller.worker.service.models.Role;

public class AuthResponse
{
    private String jwt;
    private String message;
    private Role role;

    public String getJwt() {
        return jwt;
    }

    public void setJwt(String jwt) {
        this.jwt = jwt;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public Role getRole() {
        return role;
    }

    public void setRole(Role role) {
        this.role = role;
    }
}

