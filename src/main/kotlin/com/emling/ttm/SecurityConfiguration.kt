package com.emling.ttm

import org.springframework.beans.factory.annotation.Autowired
import org.springframework.context.annotation.Configuration
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder
import org.springframework.security.config.annotation.method.configuration.EnableGlobalMethodSecurity
import org.springframework.security.config.annotation.web.builders.HttpSecurity
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter

@Configuration
@EnableWebSecurity
@EnableGlobalMethodSecurity(prePostEnabled = true)
class SecurityConfiguration(
    @Autowired
    private var userDetailsService: SpringDataJpaUserDetailsService
) : WebSecurityConfigurerAdapter() {

    override fun configure(auth: AuthenticationManagerBuilder?) {
        auth!!
            .userDetailsService(this.userDetailsService)
                .passwordEncoder(User.PASSWORD_ENCODER)
    }

    override fun configure(http: HttpSecurity?) {
        http!!
            .authorizeRequests()
                .antMatchers("/built/**", "/main.css").permitAll()
                .anyRequest().authenticated()
                .and()
            .formLogin()
                //.loginPage("/auth/login")
                //.loginProcessingUrl("/auth/process")
                .defaultSuccessUrl("/", true)
                //.failureUrl("/auth/failure")
                .permitAll()
                .and()
            .httpBasic()
                .and()
            // TODO csrf is disabled for demo purposes only
            .csrf().disable()
            .logout()
                .logoutSuccessUrl("/")
    }
}