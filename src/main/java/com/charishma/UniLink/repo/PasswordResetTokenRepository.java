package com.charishma.UniLink.repo;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.charishma.UniLink.model.PasswordResetToken;

public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetToken, Long> {
	Optional<PasswordResetToken> findTopByEmailAndUsedAtIsNullOrderByCreatedAtDesc(String email);

	Optional<PasswordResetToken> findTopByEmailOrderByCreatedAtDesc(String email);
}
