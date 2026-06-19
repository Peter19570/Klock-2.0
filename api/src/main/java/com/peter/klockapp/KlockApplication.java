package com.peter.klockapp;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.scheduling.annotation.EnableScheduling;

/**
 * @author 𝓟𝓔𝓣𝓔𝓡
 * */
@SpringBootApplication
@EnableJpaAuditing
@EnableScheduling
public class KlockApplication {

    public static void main(String[] args) {
        SpringApplication.run(KlockApplication.class, args);
    }

}
