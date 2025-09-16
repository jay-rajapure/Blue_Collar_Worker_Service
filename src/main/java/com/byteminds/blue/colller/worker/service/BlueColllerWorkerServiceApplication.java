package com.byteminds.blue.colller.worker.service;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class BlueColllerWorkerServiceApplication {

	public static void main(String[] args) {
		SpringApplication.run(BlueColllerWorkerServiceApplication.class, args);
	}

}