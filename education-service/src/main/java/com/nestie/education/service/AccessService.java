package com.nestie.education.service;

import com.nestie.education.exception.UnauthorizedException;
import org.springframework.stereotype.Service;

import java.util.Arrays;

@Service
public class AccessService {

    public void requireRoles(String roleHeader, String... allowedRoles) {
        String normalizedRole = normalizeRole(roleHeader);
        boolean allowed = Arrays.stream(allowedRoles).anyMatch(allowedRole -> allowedRole.equals(normalizedRole));
        if (!allowed) {
            throw new UnauthorizedException("You do not have permission to access this resource");
        }
    }

    public Long requireUserId(String userIdHeader) {
        if (userIdHeader == null || userIdHeader.isBlank()) {
            throw new UnauthorizedException("Missing authenticated user context");
        }
        try {
            return Long.parseLong(userIdHeader);
        } catch (NumberFormatException ex) {
            throw new UnauthorizedException("Invalid authenticated user context");
        }
    }

    public Long requirePatientOrAdmin(String userIdHeader, String roleHeader, Long patientId) {
        Long currentUserId = requireUserId(userIdHeader);
        String role = normalizeRole(roleHeader);
        if ("ADMIN".equals(role) || currentUserId.equals(patientId)) {
            return currentUserId;
        }
        throw new UnauthorizedException("You can only access your own education progress");
    }

    public String normalizeRole(String roleHeader) {
        if (roleHeader == null || roleHeader.isBlank()) {
            throw new UnauthorizedException("Missing authenticated role context");
        }
        return roleHeader.startsWith("ROLE_") ? roleHeader.substring(5) : roleHeader;
    }
}