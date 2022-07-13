package com.emling.ttm

import com.fasterxml.jackson.annotation.JsonIgnore
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder
import org.springframework.security.crypto.password.PasswordEncoder
import java.util.*
import javax.persistence.Entity
import javax.persistence.GeneratedValue
import javax.persistence.Id
import javax.persistence.Table


@Entity
// Name "User" (in Postgres) is reserved, define table name as a workaround.
@Table(name="users")
open class User constructor(
    private var name: String,
    // Exclude password hash from json, toString, etc; for security.
    @JsonIgnore private var password: String,
    private var roles: Array<String>) {

    @Id
    @GeneratedValue
    private var id: Long? = null

    companion object {
        val PASSWORD_ENCODER: PasswordEncoder = BCryptPasswordEncoder()
    }

    init {
        setPassword(password)
    }

    internal constructor() : this("", "", arrayOf<String>())

    open fun getId(): Long? {
        return id
    }

    open fun setId(id: Long?) {
        this.id = id
    }

    open fun getName(): String {
        return name
    }

    open fun setName(name: String) {
        this.name = name
    }

    open fun getPassword(): String {
        return password
    }

    open fun setPassword(password: String) {
        this.password = PASSWORD_ENCODER.encode(password);
    }

    open fun getRoles(): Array<String> {
        return roles
    }

    open fun setRoles(roles: Array<String>) {
        this.roles = roles
    }

    override fun equals(other: Any?): Boolean {
        // TODO '==='?
        if (this === other) return true
        if (other == null || javaClass != other.javaClass) return false
        val user: User = other as User
        return Objects.equals(id, user.id) &&
                Objects.equals(name, user.name) &&
                Objects.equals(password, user.password) &&
                Objects.equals(roles, user.roles)
    }

    override fun hashCode(): Int {
        var result = Objects.hash(id, name, password)
        result = 31 * result + roles.contentHashCode()
        return result
    }

    override fun toString(): String {
        // TODO toString builder?
        return "User{" +
                "id=" + id +
                ", name='" + name + '\'' +
                ", roles=" + roles.contentToString() +
                '}';
    }
}