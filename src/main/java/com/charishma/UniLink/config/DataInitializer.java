package com.charishma.UniLink.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.charishma.UniLink.model.Role;
import com.charishma.UniLink.model.User;
import com.charishma.UniLink.repo.UserRepository;

@Configuration
public class DataInitializer implements CommandLineRunner {
	private final UserRepository userRepository;
	private final PasswordEncoder passwordEncoder;

	public DataInitializer(UserRepository userRepository, PasswordEncoder passwordEncoder) {
		this.userRepository = userRepository;
		this.passwordEncoder = passwordEncoder;
	}

	@Override
	public void run(String... args) {
		if (userRepository.count() > 0) {
			return;
		}

		userRepository.save(createUser("student@srkrec.ac.in", "Student@123", Role.STUDENT, "Student User"));
		userRepository.save(createUser("events@srkrec.ac.in", "Events@123", Role.EVENT_MANAGER, "Event Manager"));
		userRepository.save(createUser("admin@srkrec.ac.in", "Admin@123", Role.ADMIN, "Admin User"));
	}

	private User createUser(String email, String rawPassword, Role role, String name) {
		User user = new User();
		user.setEmail(email);
		user.setPasswordHash(passwordEncoder.encode(rawPassword));
		user.setRole(role);
		user.setName(name);
		return user;
	}
}
