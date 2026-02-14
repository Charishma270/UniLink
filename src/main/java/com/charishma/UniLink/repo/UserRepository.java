package com.charishma.UniLink.repo;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.charishma.UniLink.model.User;

public interface UserRepository extends JpaRepository<User, Long> {
	Optional<User> findByEmail(String email);
}
