package com.nestie.auth.service;

import com.nestie.auth.dto.AuthDTO;
import com.nestie.auth.dto.PageResponse;
import com.nestie.auth.entity.Role;
import com.nestie.auth.entity.User;
import com.nestie.auth.exception.ResourceNotFoundException;
import com.nestie.auth.repository.UserRepository;
import com.nestie.auth.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public PageResponse<AuthDTO.UserResponse> getAllUsers(int page, int size) {
        Page<User> users = userRepository.findAll(PageRequest.of(page, size, Sort.by("createdAt").descending()));
        return buildPageResponse(users);
    }

    public AuthDTO.UserResponse getUserById(Long id) {
        User user = userRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));
        return mapToResponse(user);
    }

    public AuthDTO.UserResponse getUserByEmail(String email) {
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new ResourceNotFoundException("User", "email", email));
        return mapToResponse(user);
    }

    public List<AuthDTO.UserResponse> getDoctors() {
        return userRepository.findByRole(Role.DOCTOR).stream()
            .map(this::mapToResponse).toList();
    }

    public AuthDTO.UserResponse updateUser(Long id, AuthDTO.UpdateRequest request) {
        User user = userRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));

        if (request.getFullName() != null) user.setFullName(request.getFullName());
        if (request.getPhone() != null) user.setPhone(request.getPhone());
        if (request.getAvatarUrl() != null) user.setAvatarUrl(request.getAvatarUrl());

        return mapToResponse(userRepository.save(user));
    }

    public void deleteUser(Long id) {
        if (!userRepository.existsById(id)) {
            throw new ResourceNotFoundException("User", "id", id);
        }
        userRepository.deleteById(id);
    }

    private AuthDTO.UserResponse mapToResponse(User user) {
        return AuthDTO.UserResponse.builder()
            .id(user.getId())
            .fullName(user.getFullName())
            .email(user.getEmail())
            .phone(user.getPhone())
            .role(user.getRole())
            .avatarUrl(user.getAvatarUrl())
            .enabled(user.isEnabled())
            .createdAt(user.getCreatedAt())
            .build();
    }

    private PageResponse<AuthDTO.UserResponse> buildPageResponse(Page<User> page) {
        return PageResponse.<AuthDTO.UserResponse>builder()
            .content(page.getContent().stream().map(this::mapToResponse).toList())
            .page(page.getNumber())
            .size(page.getSize())
            .totalElements(page.getTotalElements())
            .totalPages(page.getTotalPages())
            .last(page.isLast())
            .build();
    }
}
