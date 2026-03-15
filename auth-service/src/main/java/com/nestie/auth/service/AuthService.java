package com.nestie.auth.service;

import com.nestie.auth.dto.AuthDTO;
import com.nestie.auth.entity.Role;
import com.nestie.auth.entity.User;
import com.nestie.auth.exception.BadRequestException;
import com.nestie.auth.repository.UserRepository;
import com.nestie.auth.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;
    private final AuthenticationManager authenticationManager;

    public AuthDTO.AuthResponse register(AuthDTO.RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email already registered");
        }

        User user = User.builder()
            .fullName(request.getFullName())
            .email(request.getEmail())
            .password(passwordEncoder.encode(request.getPassword()))
            .phone(request.getPhone())
            .role(Role.PATIENT)
            .enabled(true)
            .build();

        user = userRepository.save(user);

        String token = tokenProvider.generateTokenFromEmail(
            user.getEmail(), user.getId(), user.getRole().name());

        return AuthDTO.AuthResponse.builder()
            .accessToken(token)
            .tokenType("Bearer")
            .user(mapToResponse(user))
            .build();
    }

    public AuthDTO.AuthResponse login(AuthDTO.LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword()));

        User user = userRepository.findByEmail(request.getEmail())
            .orElseThrow(() -> new BadRequestException("User not found"));

        String token = tokenProvider.generateToken(
            authentication, user.getId(), user.getRole().name());

        return AuthDTO.AuthResponse.builder()
            .accessToken(token)
            .tokenType("Bearer")
            .user(mapToResponse(user))
            .build();
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
}
