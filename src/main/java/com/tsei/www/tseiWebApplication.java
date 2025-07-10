package com.tsei.www;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.security.servlet.SecurityAutoConfiguration;


@SpringBootApplication(exclude={SecurityAutoConfiguration.class}) 
//@SpringBootApplication
public class tseiWebApplication {

    public static void main(String[] args) {
        SpringApplication.run(tseiWebApplication.class, args);
    }

}



