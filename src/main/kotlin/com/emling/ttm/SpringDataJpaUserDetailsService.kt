package com.emling.ttm

import org.springframework.beans.factory.annotation.Autowired
import org.springframework.security.core.authority.AuthorityUtils
import org.springframework.security.core.userdetails.UserDetails
import org.springframework.security.core.userdetails.UserDetailsService
import org.springframework.stereotype.Component


@Component
class SpringDataJpaUserDetailsService constructor(
    @Autowired
    private val userRepository: UserRepository
) : UserDetailsService {

    override fun loadUserByUsername(username: String?): UserDetails {
        val user: User = userRepository.findByName(username)!!
        return org.springframework.security.core.userdetails.User(
            user.getName(), user.getPassword(),
            AuthorityUtils.createAuthorityList(*user.getRoles())
        )
    }

}